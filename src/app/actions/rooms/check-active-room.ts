// src/app/actions/rooms/check-active-room.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

export async function checkActiveRoom() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { hasActiveRoom: false, roomId: null };

  return fetchActiveRoom(clerkUserId);
}

async function fetchActiveRoom(clerkUserId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.userRoom(clerkUserId));

  try {
    const room = await prisma.room.findFirst({
      where: {
        host: { clerkUserId },
        status: "OPEN",
      },
      select: { id: true },
    });

    return { hasActiveRoom: !!room, roomId: room?.id ?? null };
  } catch (err) {
    console.error("[checkActiveRoom] Error:", err);
    return { hasActiveRoom: false, roomId: null };
  }
}