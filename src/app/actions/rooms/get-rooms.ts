// src/app/actions/rooms/get-rooms.ts
"use server";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { listLiveKitParticipants } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

export interface RoomParticipant {
  identity: string;
  name: string;
  avatarUrl: string | null;
}

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
  participants: RoomParticipant[];
}

export type GetRoomsResult =
  | { success: true; rooms: RoomData[] }
  | { success: false; error: string };

export async function getRooms(): Promise<GetRoomsResult> {
  try {
    return await fetchRooms();
  } catch (err) {
    console.error("[getRooms] Error:", err);
    return { success: false, error: "Failed to load rooms." };
  }
}

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
      liveKitRoomName: true, // We select it to use in the LiveKit fetch below
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

  const roomsWithParticipants = await Promise.all(
    rooms.map(async (room) => {
      let participants: RoomParticipant[] = [];
      
      try {
        const livekitParticipants = await listLiveKitParticipants(room.liveKitRoomName);
        
        participants = livekitParticipants.map((p) => {
          let avatarUrl = null;
          try {
            if (p.metadata) {
              avatarUrl = JSON.parse(p.metadata).avatarUrl;
            }
          } catch {}
          
          return {
            identity: p.identity,
            name: p.name || "Guest",
            avatarUrl,
          };
        });
      } catch {
        // If LiveKit is slow or room hasn't started, just return empty array
      }

      // ✅ FIXED: Explicitly pick the fields we want, avoiding the unused destructuring error.
      return {
        id: room.id,
        title: room.title,
        description: room.description,
        language: room.language,
        maxParticipants: room.maxParticipants,
        createdAt: room.createdAt.toISOString(),
        host: room.host,
        participants,
      };
    })
  );

  return {
    success: true,
    rooms: roomsWithParticipants,
  };
}