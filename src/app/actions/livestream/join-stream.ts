// src/app/actions/livestream/join-stream.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { createLiveKitToken, listLiveKitParticipants } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  streamId: z.string().min(1, "streamId is required"),
});

export type JoinStreamResult =
  | {
      success: true;
      token: string;
      liveKitUrl: string;
      roomName: string;
      isHost: boolean;
    }
  | { success: false; error: string };

export async function joinLiveStream(
  input: z.infer<typeof inputSchema>,
): Promise<JoinStreamResult> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid stream ID." };
    const { streamId } = parsed.data;

    const [me, stream] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, name: true },
      }),
      prisma.liveStream.findUnique({
        where: { id: streamId },
        select: { id: true, status: true, liveKitRoomName: true, hostId: true },
      }),
    ]);

    if (!me) return { success: false, error: "User not found." };
    if (!stream) return { success: false, error: "Stream not found." };
    if (stream.status !== "LIVE") return { success: false, error: "This stream has ended." };

    const liveKitUrl = process.env.LIVEKIT_URL;
    if (!liveKitUrl) return { success: false, error: "LiveKit not configured." };

    const isHost = stream.hostId === me.id;

    try {
      const activeParticipants = await listLiveKitParticipants(stream.liveKitRoomName);
      if (activeParticipants.some((p) => p.identity === me.id)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch {}

    const token = await createLiveKitToken({
      roomName: stream.liveKitRoomName,
      participantId: me.id,
      participantName: me.name,
      metadata: JSON.stringify({ role: isHost ? "host" : "viewer" }),
      ttl: 60 * 60,
    });

    return { success: true, token, liveKitUrl, roomName: stream.liveKitRoomName, isHost };
  } catch (err) {
    console.error("[joinLiveStream] Error:", err);
    return { success: false, error: "Failed to join stream." };
  }
}