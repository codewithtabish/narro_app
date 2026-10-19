// src/app/actions/rooms/delete-room.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
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

    const { roomId } = inputSchema.parse(input);

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

    /* ✅ 1. INSTANTLY clear the /rooms page cache. */
    // This runs synchronously so the user sees the room disappear 
    // the moment they are redirected back to the list.
    revalidatePath("/rooms");
    revalidateSingleRoom(roomId);
    revalidateRooms();

    /* ✅ 2. Background Task: Delete from LiveKit and DB. */
    // The user doesn't wait for these expensive operations.
    after(async () => {
      try {
        await deleteLiveKitRoom(room.liveKitRoomName);
        
        await prisma.room.delete({
          where: { id: roomId },
        });
      } catch (err) {
        console.error("[deleteRoom] Background cleanup error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[deleteRoom] Error:", err);
    return { success: false, error: "Failed to delete room." };
  }
}