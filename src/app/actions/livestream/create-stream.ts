// src/app/actions/livestream/create-stream.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { z } from "zod";

import { revalidateLiveStreams, revalidateUserActiveStream } from "@/lib/cache-keys";
import { createLiveKitRoom, createLiveKitToken, generateCallRoomName } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";
import { getMyActiveStream } from "./get-my-active-stream"; // ✅ Import the check

const inputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(200).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export type CreateStreamInput = z.infer<typeof inputSchema>;

export async function createLiveStream(input: CreateStreamInput) {
  try {
    /* ── 1. Auth ── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const { title, description, thumbnailUrl } = parsed.data;

    /* ── 2. Load Host ── */
    const host = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true, name: true, imageUrl: true, profileImageUrl: true },
    });
    if (!host) return { success: false, error: "User not found." };

    /* ── 3. Create DB Record (Instant) ── */
    const stream = await prisma.liveStream.create({
      data: {
        hostId: host.id,
        title,
        description,
        thumbnailUrl,
        liveKitRoomName: `pending-${crypto.randomUUID()}`,
        status: "LIVE",
      },
    });

    const liveKitRoomName = generateCallRoomName(stream.id);

    /* ── 4. Generate Host Token (Instant) ── */
    const avatarUrl = host.profileImageUrl ?? host.imageUrl ?? null;
    const token = await createLiveKitToken({
      roomName: liveKitRoomName,
      participantId: host.id,
      participantName: host.name,
      metadata: JSON.stringify({ avatarUrl, role: "host" }),
      ttl: 60 * 60 * 24,
    });

    /* ── 5. Clear Cache Instantly ── */
    revalidateLiveStreams();
    revalidateUserActiveStream(clerkUserId);

    /* ── 6. Background: Warm the Cache & LiveKit Setup ── */
    after(async () => {
      try {
        // ✅ BACKGROUND SAFETY CHECK & CACHE WARMUP
        // This ensures the user's "active stream" cache is perfectly primed.
        await getMyActiveStream();

        // Create the LiveKit room
        await createLiveKitRoom({
          name: liveKitRoomName,
          emptyTimeout: 60 * 60,
          maxParticipants: 1000,
        });

        await prisma.liveStream.update({
          where: { id: stream.id },
          data: { liveKitRoomName },
        });
        
        console.log(`[createLiveStream] LiveKit room ${liveKitRoomName} ready & cache warmed.`);
      } catch (err) {
        console.error("[createLiveStream] Background error:", err);
        await prisma.liveStream.update({
          where: { id: stream.id },
          data: { status: "ENDED" },
        }).catch(() => {});
      }
    });

    /* ── 7. Return Instantly ── */
    return { success: true, streamId: stream.id, token, liveKitUrl: process.env.LIVEKIT_URL! };
  } catch (err) {
    console.error("[createLiveStream] Error:", err);
    return { success: false, error: "Failed to start stream." };
  }
}