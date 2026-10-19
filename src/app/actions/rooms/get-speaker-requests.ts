// src/app/actions/rooms/get-speaker-requests.ts
"use server";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { cacheLife, cacheTag } from "next/cache";

export async function getSpeakerRequests(roomId: string) {
  "use cache";
  cacheLife("max"); // ✅ Changed to max for instant updates
  cacheTag(CACHE_TAGS.roomRequests(roomId));

  try {
    const requests = await prisma.roomSpeakerRequest.findMany({
      where: { roomId, status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, imageUrl: true, profileImageUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return requests.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.user.name,
      avatarUrl: r.user.profileImageUrl ?? r.user.imageUrl ?? null,
    }));
  } catch (err) {
    console.error("[getSpeakerRequests] Error:", err);
    return [];
  }
}