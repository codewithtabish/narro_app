// src/app/actions/rooms/get-speaker-requests.ts
"use server";

import prisma from "@/lib/clients/prisma-client";
import { getCurrentUser } from "@/lib/rooms/current-user.server";
import type { SpeakerRequestItem } from "@/lib/rooms/room-events";

// Intentionally NOT cached: this is live, per-room data (host only).
export async function getSpeakerRequests(roomId: string): Promise<SpeakerRequestItem[]> {
  try {
    const [me, room] = await Promise.all([
      getCurrentUser(),
      prisma.room.findUnique({ where: { id: roomId }, select: { hostId: true } }),
    ]);
    if (!me || !room || room.hostId !== me.id) return [];

    const requests = await prisma.roomSpeakerRequest.findMany({
      where: { roomId, status: "PENDING" },
      include: {
        user: {
          select: { id: true, name: true, imageUrl: true, profileImageUrl: true },
        },
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