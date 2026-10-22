// src/app/actions/livestream/end-stream.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { revalidateLiveStreams, revalidateUserActiveStream } from "@/lib/cache-keys";
import { deleteLiveKitRoom } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  streamId: z.string().min(1, "streamId is required"),
});

export async function endLiveStream(input: z.infer<typeof inputSchema>) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid stream ID." };
    const { streamId } = parsed.data;

    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
      select: { hostId: true, liveKitRoomName: true, status: true, host: { select: { clerkUserId: true } } },
    });

    if (!stream || stream.host.clerkUserId !== clerkUserId) {
      return { success: false, error: "Unauthorized." };
    }

    if (stream.status === "ENDED") {
      return { success: true };
    }

    // ✅ 1. UPDATE DATABASE FIRST
    await prisma.liveStream.update({
      where: { id: streamId },
      data: { status: "ENDED", endedAt: new Date() },
    });

    // ✅ 2. REVALIDATE CACHES
    // This explicitly clears the cache for getMyActiveStream
    revalidateUserActiveStream(clerkUserId);
    // This clears the directory list cache
    revalidateLiveStreams();
    
    // ✅ 3. CLEAR PATHS
    revalidatePath("/live-stream");
    revalidatePath(`/live-stream/active/${streamId}`);

    // ✅ 4. Background: LiveKit Cleanup
    after(async () => {
      try {
        await deleteLiveKitRoom(stream.liveKitRoomName);
      } catch (err) {
        console.error("[endLiveStream] LiveKit cleanup failed:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[endLiveStream] Error:", err);
    return { success: false, error: "Failed to end stream." };
  }
}