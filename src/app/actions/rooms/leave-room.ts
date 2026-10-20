// src/app/actions/rooms/leave-room.ts
"use server";

import { after } from "next/server";
import { z } from "zod";

import prisma from "@/lib/clients/prisma-client";
import { getCurrentUser } from "@/lib/rooms/current-user.server";
import type { ActionResult } from "@/lib/rooms/room-events";
import { sendRoomSignal, setParticipantRole } from "@/lib/rooms/room-signals.server";

const inputSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
});

export async function leaveRoom(input: z.infer<typeof inputSchema>): Promise<ActionResult> {
  try {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid room ID." };
    const { roomId } = parsed.data;

    const me = await getCurrentUser();
    if (!me) return { success: false, error: "Not authenticated." };

    // ✅ AWAITED: Demote them immediately so the DB is updated the moment they leave.
    // We use `updateMany` so it doesn't crash if they were already a listener.
    await prisma.roomSpeakerRequest.updateMany({
      where: { roomId, userId: me.id },
      data: { status: "DECLINED" }, // Demotes them back to audience
    });

    // ✅ BACKGROUND: Update LiveKit & notify host
    after(async () => {
      try {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          select: { status: true, hostId: true, liveKitRoomName: true },
        });
        
        if (!room || room.status !== "OPEN") return;

        // Remove their raised hand from the Host's UI
        await prisma.roomSpeakerRequest.deleteMany({
          where: { roomId, userId: me.id, status: "PENDING" },
        });
        await sendRoomSignal(room.liveKitRoomName, { type: "REQUESTS_CHANGED" }, [room.hostId]);

        // Force them to listener role in LiveKit (if they rejoin)
        try {
          await setParticipantRole(room.liveKitRoomName, me.id, "listener");
        } catch {} // Ignore if already disconnected

      } catch (err) {
        console.error("[leaveRoom] Background error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[leaveRoom] Error:", err);
    return { success: false, error: "Failed to leave room." };
  }
}