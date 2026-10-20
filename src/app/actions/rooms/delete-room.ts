// src/app/actions/rooms/delete-room.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { revalidateRooms, revalidateSingleRoom } from "@/lib/cache-keys";
import { deleteLiveKitRoom } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
});

export async function deleteRoom(
  input: z.infer<typeof inputSchema>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid room ID." };
    const { roomId } = parsed.data;

    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) return { success: false, error: "User not found." };

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { hostId: true, liveKitRoomName: true },
    });
    if (!room) return { success: false, error: "Room not found." };
    if (room.hostId !== me.id) {
      return { success: false, error: "Only the host can delete this room." };
    }

    // 1. DB first (fast). If this fails, nothing else has happened yet.
    await prisma.$transaction([
      prisma.roomSpeakerRequest.deleteMany({ where: { roomId } }),
      prisma.room.delete({ where: { id: roomId } }),
    ]);

    // 2. Kick everyone out of the audio room (guests get "The host closed the room.")
    try {
      await deleteLiveKitRoom(room.liveKitRoomName);
    } catch (err) {
      console.warn("[deleteRoom] LiveKit disconnect failed:", err);
    }

    // 3. Revalidate AFTER the data really changed
    revalidateSingleRoom(roomId);
    revalidateRooms();

    return { success: true };
  } catch (err) {
    console.error("[deleteRoom] Error:", err);
    return { success: false, error: "Failed to delete room." };
  }
}