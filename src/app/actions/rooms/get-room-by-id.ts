// src/app/actions/rooms/get-room-by-id.ts
"use server";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { listLiveKitParticipants } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";
import { cacheLife, cacheTag } from "next/cache";

export interface RoomParticipant {
  identity: string;
  name: string;
  avatarUrl: string | null;
}

export interface RoomDetails {
  id: string;
  title: string;
  status: string;
  hostId: string;
  liveKitRoomName: string;
  participants: RoomParticipant[];
}

export async function getRoomById(roomId: string): Promise<RoomDetails | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.room(roomId));

  try {
    // 1. Fetch room details from DB
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        title: true,
        status: true,
        hostId: true,
        liveKitRoomName: true,
      },
    });

    if (!room) return null;

    // 2. Fetch live participants from LiveKit
    let participants: RoomParticipant[] = [];
    try {
      const livekitParticipants = await listLiveKitParticipants(room.liveKitRoomName);
      
      participants = livekitParticipants.map((p) => {
        let avatarUrl = null;
        try {
          if (p.metadata) {
            const parsed = JSON.parse(p.metadata);
            avatarUrl = parsed.avatarUrl || null;
          }
        } catch {}

        return {
          identity: p.identity,
          name: p.name || "Guest",
          avatarUrl,
        };
      });
    } catch (err) {
      console.warn("[getRoomById] Could not fetch LiveKit participants:", err);
    }

    return {
      ...room,
      participants,
    };
  } catch (err) {
    console.error("[getRoomById] Error:", err);
    return null;
  }
}