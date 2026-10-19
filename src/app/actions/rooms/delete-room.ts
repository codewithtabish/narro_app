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

    /* ✅ 1. INSTANTLY DISCONNECT EVERYONE FROM LIVEKIT */
    // This immediately kicks all users out of the audio room.
    // It takes ~200ms, but ensures guests are disconnected before UI redirects.
    try {
      await deleteLiveKitRoom(room.liveKitRoomName);
    } catch (err) {
      console.warn("[deleteRoom] LiveKit disconnect failed:", err);
      // We continue anyway because we still need to delete the DB record.
    }

    /* ✅ 2. INSTANTLY CLEAR CACHE */
    // Now the UI is told to refresh.
    revalidatePath("/rooms");
    revalidateSingleRoom(roomId);
    revalidateRooms();

    /* ✅ 3. BACKGROUND TASK: DELETE FROM DB */
    // Deleting a DB row is fast (~10ms), but we background it to keep
    // the return time at exactly 0ms for the host.
    after(async () => {
      try {
        await prisma.room.delete({
          where: { id: roomId },
        });
      } catch (err) {
        console.error("[deleteRoom] Background DB deletion error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[deleteRoom] Error:", err);
    return { success: false, error: "Failed to delete room." };
  }
}