// src/app/actions/rooms/join-room.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import {
  createLiveKitToken,
  listLiveKitParticipants,
  livekitRoomService,
} from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
});

type LiveKitParticipants = Awaited<ReturnType<typeof listLiveKitParticipants>>;

export async function joinRoom(input: z.infer<typeof inputSchema>) {
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
        select: { id: true, status: true, liveKitRoomName: true, hostId: true },
      }),
    ]);

    if (!me) return { success: false, error: "User not found." };
    if (!room) return { success: false, error: "Room not found." };
    if (room.status !== "OPEN") return { success: false, error: "This room is closed." };

    const liveKitUrl = process.env.LIVEKIT_URL;
    if (!liveKitUrl) return { success: false, error: "LiveKit not configured." };

    const isHost = room.hostId === me.id;

    /* ── 2. Parallel Fetch (LiveKit + DB Request) ── */
    const [activeParticipants, speakerRequest] = await Promise.all([
      listLiveKitParticipants(room.liveKitRoomName).catch((): LiveKitParticipants => []),
      prisma.roomSpeakerRequest.findUnique({
        where: { roomId_userId: { roomId, userId: me.id } },
        select: { id: true, status: true },
      }),
    ]);

    /* ── 3. Ghost Session Cleanup ── */
    if (activeParticipants.some((p) => p.identity === me.id)) {
      try {
        await livekitRoomService.removeParticipant(room.liveKitRoomName, me.id);
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch {}
    }

    /* ── 4. Strict Reset to Audience Logic ── */
    let finalStatus = speakerRequest?.status;
    
    // If the user is NOT the host, and they were previously APPROVED,
    // we force them back to DECLINED so they join as a listener.
    if (!isHost && speakerRequest?.status === "APPROVED" && speakerRequest.id) {
      await prisma.roomSpeakerRequest.update({
        where: { id: speakerRequest.id },
        data: { status: "DECLINED" },
      });
      finalStatus = "DECLINED";
    }

    const isSpeaker = isHost || finalStatus === "APPROVED";
    const role = isHost ? "host" : isSpeaker ? "speaker" : "listener";
    const avatarUrl = me.profileImageUrl ?? me.imageUrl ?? null;

    /* ── 5. Generate Token ── */
    const token = await createLiveKitToken({
      roomName: room.liveKitRoomName,
      participantId: me.id,
      participantName: me.name,
      metadata: JSON.stringify({ avatarUrl, role }),
      ttl: 60 * 60,
    });

    return { success: true, token, liveKitUrl, roomName: room.liveKitRoomName };
  } catch (err) {
    console.error("[joinRoom] Error:", err);
    return { success: false, error: "Failed to join room." };
  }
}