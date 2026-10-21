// src/app/actions/livestream/get-stream-by-id.ts
"use server";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { cacheLife, cacheTag } from "next/cache";

export interface StreamDetails {
  id: string;
  title: string;
  status: string;
  liveKitRoomName: string;
  host: {
    id: string;
    name: string;
    imageUrl: string | null;
    profileImageUrl: string | null;
  };
}

export async function getStreamById(streamId: string): Promise<StreamDetails | null> {
  try {
    return await fetchStream(streamId);
  } catch (err) {
    console.error("[getStreamById] Error:", err);
    return null;
  }
}

async function fetchStream(streamId: string): Promise<StreamDetails | null> {
  "use cache";
  cacheLife("max"); // ✅ Changed to max for instant freshness
  cacheTag(CACHE_TAGS.liveStream(streamId));

  const stream = await prisma.liveStream.findUnique({
    where: { id: streamId },
    select: {
      id: true,
      title: true,
      status: true,
      liveKitRoomName: true,
      host: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          profileImageUrl: true,
        },
      },
    },
  });

  if (!stream || stream.status !== "LIVE") {
    return null;
  }

  return stream;
}