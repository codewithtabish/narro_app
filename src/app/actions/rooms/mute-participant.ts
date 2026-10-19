// src/app/actions/rooms/mute-participant.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { z } from "zod";

import { livekitRoomService } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  roomId: z.string().min(1),
  participantIdentity: z.string().min(1),
});

export async function muteParticipant(input: z.infer<typeof inputSchema>) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const { roomId, participantIdentity } = inputSchema.parse(input);

    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) return { success: false, error: "User not found." };

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { hostId: true, liveKitRoomName: true },
    });
    if (room?.hostId !== me.id) {
      return { success: false, error: "Only the host can mute participants." };
    }

    // ✅ 1. No UI update needed here, LiveKit handles the mute state locally.

    // ✅ 2. Background LiveKit Mute
    after(async () => {
      try {
        await livekitRoomService.mutePublishedTrack(
          room.liveKitRoomName,
          participantIdentity,
          "microphone",
          true
        );
      } catch (err) {
        console.error("[muteParticipant] Background error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[muteParticipant] Error:", err);
    return { success: false, error: "Failed to mute participant." };
  }
}