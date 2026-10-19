// src/app/actions/rooms/join-room.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { createLiveKitToken, listLiveKitParticipants, livekitRoomService } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
});

export async function joinRoom(input: z.infer<typeof inputSchema>) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid room ID." };
    const { roomId } = parsed.data;

    const [me, room] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, name: true, imageUrl: true, profileImageUrl: true },
      }),
      prisma.room.findUnique({
        where: { id: roomId },
        select: { id: true, status: true, liveKitRoomName: true, hostId: true },
      }),
    ]);

    if (!me) return { success: false, error: "User not found." };
    if (!room) return { success: false, error: "Room not found." };
    if (room.status !== "OPEN") return { success: false, error: "This room is closed." };

    const liveKitUrl = process.env.LIVEKIT_URL;
    if (!liveKitUrl) return { success: false, error: "LiveKit not configured." };

    // Ghost session cleanup
    try {
      const activeParticipants = await listLiveKitParticipants(room.liveKitRoomName);
      const isAlreadyConnected = activeParticipants.some((p) => p.identity === me.id);
      if (isAlreadyConnected) {
        await livekitRoomService.removeParticipant(room.liveKitRoomName, me.id);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } catch {}

    const isHost = room.hostId === me.id;
    const speakerRequest = await prisma.roomSpeakerRequest.findUnique({
      where: { roomId_userId: { roomId, userId: me.id } },
    });
    const isSpeaker = isHost || speakerRequest?.status === "APPROVED";
    const role = isHost ? "host" : isSpeaker ? "speaker" : "listener";
    const avatarUrl = me.profileImageUrl ?? me.imageUrl ?? null;

    const token = await createLiveKitToken({
      roomName: room.liveKitRoomName,
      participantId: me.id,
      participantName: me.name,
      metadata: JSON.stringify({ avatarUrl, role }),
      ttl: 60 * 60,
    });

    // ❌ REMOVED: after(() => revalidateSingleRoom(roomId));

    return { success: true, token, liveKitUrl, roomName: room.liveKitRoomName };
  } catch (err) {
    console.error("[joinRoom] Error:", err);
    return { success: false, error: "Failed to join room." };
  }
}