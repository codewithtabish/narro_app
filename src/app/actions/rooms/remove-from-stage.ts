// src/app/actions/rooms/remove-from-stage.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { z } from "zod";

import { revalidateSingleRoom, revalidateSpeakerRequests } from "@/lib/cache-keys";
import { livekitRoomService } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  roomId: z.string().min(1),
  participantIdentity: z.string().min(1),
});

export async function removeFromStage(input: z.infer<typeof inputSchema>) {
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
      return { success: false, error: "Only the host can remove speakers." };
    }

    // ✅ 1. Instantly update UI
    revalidateSpeakerRequests(roomId);
    revalidateSingleRoom(roomId);

    // ✅ 2. Background LiveKit Mute, Metadata Update & DB Update
    after(async () => {
      try {
        // 1. Get the existing metadata of the user
        const participant = await livekitRoomService.getParticipant(
          room.liveKitRoomName,
          participantIdentity
        );
        
        let currentMeta = {};
        try {
          if (participant?.metadata) currentMeta = JSON.parse(participant.metadata);
        } catch {}

        // 2. Update LiveKit: Mute the mic AND change role to listener
        await livekitRoomService.mutePublishedTrack(
          room.liveKitRoomName,
          participantIdentity,
          "microphone",
          true
        );

        await livekitRoomService.updateParticipant(
          room.liveKitRoomName,
          participantIdentity,
          JSON.stringify({ ...currentMeta, role: "listener" }) // ✅ Force role change
        );

        // 3. Update DB
        await prisma.roomSpeakerRequest.updateMany({
          where: { roomId, userId: participantIdentity },
          data: { status: "DECLINED" },
        });
      } catch (err) {
        console.error("[removeFromStage] Background error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[removeFromStage] Error:", err);
    return { success: false, error: "Failed to remove from stage." };
  }
}