// src/app/actions/rooms/request-speaker.ts
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

export async function requestSpeaker(roomId: string): Promise<ActionResult> {
  try {
    const [me, room] = await Promise.all([
      getCurrentUser(),
      prisma.room.findUnique({
        where: { id: roomId },
        select: { status: true, hostId: true, liveKitRoomName: true },
      }),
    ]);
    if (!me) return { success: false, error: "Not authenticated." };
    if (!room || room.status !== "OPEN") {
      return { success: false, error: "This room is not available." };
    }
    if (room.hostId === me.id) {
      return { success: false, error: "You are the host." };
    }

    const existing = await prisma.roomSpeakerRequest.findUnique({
      where: { roomId_userId: { roomId, userId: me.id } },
      select: { status: true },
    });

    if (existing?.status === "PENDING") return { success: true }; // duplicate click

    // Self-heal: approved in DB but never promoted in LiveKit (failed background job)
    if (existing?.status === "APPROVED") {
      after(async () => {
        try {
          await retry(() => setParticipantRole(room.liveKitRoomName, me.id, "speaker"));
          await sendRoomSignal(room.liveKitRoomName, { type: "REQUEST_APPROVED" }, [me.id]);
        } catch (err) {
          console.warn("[requestSpeaker] self-heal failed:", err);
        }
      });
      return { success: true };
    }

    // Awaited (one fast write): guarantees ordering against a quick cancel.
    await prisma.roomSpeakerRequest.upsert({
      where: { roomId_userId: { roomId, userId: me.id } },
      create: { roomId, userId: me.id, status: "PENDING" },
      update: { status: "PENDING" },
    });

    // Background: nudge the host in real time
    after(async () => {
      await sendRoomSignal(room.liveKitRoomName, { type: "REQUESTS_CHANGED" }, [room.hostId]);
    });

    return { success: true };
  } catch (err) {
    console.error("[requestSpeaker] Error:", err);
    return { success: false, error: "Could not send your request." };
  }
}