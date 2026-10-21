// src/app/actions/livestream/get-my-active-stream.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

export async function getMyActiveStream() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { hasActiveStream: false, streamId: null };

  return fetchActiveStream(clerkUserId);
}

async function fetchActiveStream(clerkUserId: string) {
  "use cache";
  cacheLife("max"); // ✅ Max freshness
  cacheTag(CACHE_TAGS.userActiveStream(clerkUserId));

  try {
    const stream = await prisma.liveStream.findFirst({
      where: {
        host: { clerkUserId },
        status: "LIVE",
      },
      select: { id: true },
    });

    return { hasActiveStream: !!stream, streamId: stream?.id ?? null };
  } catch (err) {
    console.error("[getMyActiveStream] Error:", err);
    return { hasActiveStream: false, streamId: null };
  }
}