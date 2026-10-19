// src/app/actions/rooms/get-rooms.ts
"use server";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface RoomData {
  id: string;
  title: string;
  description: string | null;
  language: string;
  maxParticipants: number;
  createdAt: string;
  host: {
    id: string;
    name: string;
    imageUrl: string | null;
    profileImageUrl: string | null;
  };
}

export type GetRoomsResult =
  | { success: true; rooms: RoomData[] }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  getRooms                                                                   */
/* -------------------------------------------------------------------------- */

export async function getRooms(): Promise<GetRoomsResult> {
  try {
    return await fetchRooms();
  } catch (err) {
    console.error("[getRooms] Error:", err);
    return { success: false, error: "Failed to load rooms." };
  }
}

/* -------------------------------------------------------------------------- */
/*  Cached fetch                                                               */
/* -------------------------------------------------------------------------- */

async function fetchRooms(): Promise<GetRoomsResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.rooms);

  const rooms = await prisma.room.findMany({
    where: {
      status: "OPEN",
      visibility: "PUBLIC",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      language: true,
      maxParticipants: true,
      createdAt: true,
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

  return {
    success: true,
    rooms: rooms.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}