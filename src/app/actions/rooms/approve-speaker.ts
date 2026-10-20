// src/app/actions/rooms/approve-speaker.ts
"use server";

import { after } from "next/server";

import prisma from "@/lib/clients/prisma-client";
import { getCurrentUser } from "@/lib/rooms/current-user.server";
import type { ActionResult } from "@/lib/rooms/room-events";
import {
  retry,
  sendRoomSignal,
  setParticipantRole,
} from "@/lib/rooms/room-signals.server";

export async function handleSpeakerRequest(
  requestId: string,
  status: "APPROVED" | "DECLINED",
  roomId: string,
): Promise<ActionResult> {
  try {
    const [me, room, request] = await Promise.all([
      getCurrentUser(),
      prisma.room.findUnique({
        where: { id: roomId },
        select: { hostId: true, liveKitRoomName: true },
      }),
      prisma.roomSpeakerRequest.findUnique({
        where: { id: requestId },
        select: { roomId: true, userId: true, status: true },
      }),
    ]);
    if (!me) return { success: false, error: "Not authenticated." };
    if (!room || room.hostId !== me.id) {
      return { success: false, error: "Only the host can manage requests." };
    }
    if (!request || request.roomId !== roomId) {
      return { success: false, error: "That request no longer exists." };
    }
    if (request.status !== "PENDING") return { success: true }; // already handled

    // Awaited (one fast write): the source of truth is saved before anything else happens
    await prisma.roomSpeakerRequest.update({
      where: { id: requestId },
      data: { status },
    });

    // Background: promote in LiveKit (with retry), then notify the guest
    after(async () => {
      if (status === "APPROVED") {
        try {
          // If the guest already left, join-room makes them a speaker on return.
          await retry(() => setParticipantRole(room.liveKitRoomName, request.userId, "speaker"));
        } catch (err) {
          console.warn("[handleSpeakerRequest] promote failed:", err);
        }
      }
      await sendRoomSignal(
        room.liveKitRoomName,
        { type: status === "APPROVED" ? "REQUEST_APPROVED" : "REQUEST_DECLINED" },
        [request.userId],
      );
    });

    return { success: true };
  } catch (err) {
    console.error("[handleSpeakerRequest] Error:", err);
    return { success: false, error: "Could not update the request." };
  }
}