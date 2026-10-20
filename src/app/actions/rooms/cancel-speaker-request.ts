// src/app/actions/rooms/cancel-speaker-request.ts
"use server";

import { after } from "next/server";

import prisma from "@/lib/clients/prisma-client";
import { getCurrentUser } from "@/lib/rooms/current-user.server";
import type { ActionResult } from "@/lib/rooms/room-events";
import { sendRoomSignal } from "@/lib/rooms/room-signals.server";

export async function cancelSpeakerRequest(roomId: string): Promise<ActionResult> {
  try {
    const [me, room] = await Promise.all([
      getCurrentUser(),
      prisma.room.findUnique({
        where: { id: roomId },
        select: { hostId: true, liveKitRoomName: true },
      }),
    ]);
    if (!me) return { success: false, error: "Not authenticated." };
    if (!room) return { success: false, error: "Room not found." };

    // Awaited (one fast write) so it can never run before the request's write
    await prisma.roomSpeakerRequest.deleteMany({
      where: { roomId, userId: me.id, status: "PENDING" },
    });

    after(async () => {
      await sendRoomSignal(room.liveKitRoomName, { type: "REQUESTS_CHANGED" }, [room.hostId]);
    });

    return { success: true };
  } catch (err) {
    console.error("[cancelSpeakerRequest] Error:", err);
    return { success: false, error: "Could not cancel your request." };
  }
}