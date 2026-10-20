// src/app/actions/rooms/leave-room.ts
"use server";

import { after } from "next/server";
import { z } from "zod";

import { revalidateSingleRoom } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { getCurrentUser } from "@/lib/rooms/current-user.server";
import type { ActionResult } from "@/lib/rooms/room-events";
import { sendRoomSignal } from "@/lib/rooms/room-signals.server";

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

    // Everything is background: the leaver never waits.
    after(async () => {
      try {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          select: { status: true, hostId: true, liveKitRoomName: true },
        });
        if (!room || room.status !== "OPEN") return;

        // Leaving with a raised hand: drop it and refresh the host's list
        const { count } = await prisma.roomSpeakerRequest.deleteMany({
          where: { roomId, userId: me.id, status: "PENDING" },
        });
        if (count > 0) {
          await sendRoomSignal(room.liveKitRoomName, { type: "REQUESTS_CHANGED" }, [
            room.hostId,
          ]);
        }

        // Room stays OPEN. Refresh cached room snapshot for everyone else.
        revalidateSingleRoom(roomId);
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