// src/app/actions/rooms/leave-room.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { z } from "zod";

import { revalidateSingleRoom } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
});

export async function leaveRoom(
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

    // ✅ BACKGROUND TASK: Update cache for other users, keep room OPEN.
    after(async () => {
      try {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          select: { status: true },
        });

        if (!room || room.status !== "OPEN") return;

        // We DO NOT close the room. We just tell Next.js to refresh the cache
        // so the participant count updates for others.
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