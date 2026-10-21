// src/app/actions/livestream/get-live-streams.ts
"use server";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { cacheLife, cacheTag } from "next/cache";

export interface LiveStreamData {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  viewerCount: number;
  createdAt: string;
  host: {
    id: string;
    name: string;
    imageUrl: string | null;
    profileImageUrl: string | null;
    bio: string | null;
    interests: string[];
  };
}

export type GetLiveStreamsResult =
  | { success: true; streams: LiveStreamData[] }
  | { success: false; error: string };

export async function getLiveStreams(): Promise<GetLiveStreamsResult> {
  try {
    return await fetchLiveStreams();
  } catch (err) {
    console.error("[getLiveStreams] Error:", err);
    return { success: false, error: "Failed to load live streams." };
  }
}

async function fetchLiveStreams(): Promise<GetLiveStreamsResult> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.liveStreams);

  const streams = await prisma.liveStream.findMany({
    where: { status: "LIVE" }, // ✅ Only fetch LIVE streams
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      viewerCount: true,
      createdAt: true,
      host: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          profileImageUrl: true,
          bio: true,
          interests: true,
        },
      },
    },
  });

  return {
    success: true,
    streams: streams.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
  };
}