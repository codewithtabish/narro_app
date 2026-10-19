// src/app/actions/rooms/join-room.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { z } from "zod";

import { revalidateSingleRoom } from "@/lib/cache-keys";
import { createLiveKitToken, listLiveKitParticipants } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
});

export type JoinRoomResult =
  | {
      success: true;
      token: string;
      liveKitUrl: string;
      roomName: string;
    }
  | { success: false; error: string };

export async function joinRoom(
  input: z.infer<typeof inputSchema>,
): Promise<JoinRoomResult> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid room ID." };
    const { roomId } = parsed.data;

    /* ── 1. Parallel Fetch (User + Room) ── */
    const [me, room] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, name: true, imageUrl: true, profileImageUrl: true },
      }),
      prisma.room.findUnique({
        where: { id: roomId },
        select: { id: true, status: true, liveKitRoomName: true },
      }),
    ]);

    if (!me) return { success: false, error: "User not found." };
    if (!room) return { success: false, error: "Room not found." };
    if (room.status !== "OPEN") return { success: false, error: "This room is closed." };

    const liveKitUrl = process.env.LIVEKIT_URL;
    if (!liveKitUrl) return { success: false, error: "LiveKit not configured." };

    /* ── 2. Check for Duplicate Connection ── */
    try {
      const activeParticipants = await listLiveKitParticipants(room.liveKitRoomName);
      const isAlreadyConnected = activeParticipants.some((p) => p.identity === me.id);

      if (isAlreadyConnected) {
        return { 
          success: false, 
          error: "You are already connected to this room in another tab or window." 
        };
      }
    } catch {
      // ✅ FIXED: Removed unused 'err' variable. 
      // If the room isn't fully initialized in LiveKit yet, ignore and proceed.
    }

    /* ── 3. Generate Token ── */
    const avatarUrl = me.profileImageUrl ?? me.imageUrl ?? null;

    const token = await createLiveKitToken({
      roomName: room.liveKitRoomName,
      participantId: me.id,
      participantName: me.name,
      metadata: JSON.stringify({ avatarUrl }),
      ttl: 60 * 60,
    });

    /* ── 4. Background: Revalidate Cache ── */
    after(() => {
      revalidateSingleRoom(roomId);
    });

    return {
      success: true,
      token,
      liveKitUrl,
      roomName: room.liveKitRoomName,
    };
  } catch (err) {
    console.error("[joinRoom] Error:", err);
    return { success: false, error: "Failed to join room." };
  }
}