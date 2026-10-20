// src/app/actions/rooms/mute-participant.ts
"use server";

import { after } from "next/server";
import { z } from "zod";

import prisma from "@/lib/clients/prisma-client";
import { getCurrentUser } from "@/lib/rooms/current-user.server";
import type { ActionResult } from "@/lib/rooms/room-events";
import { muteMicrophone, retry } from "@/lib/rooms/room-signals.server";

const inputSchema = z.object({
  roomId: z.string().min(1),
  participantIdentity: z.string().min(1),
});

export async function muteParticipant(
  input: z.infer<typeof inputSchema>,
): Promise<ActionResult> {
  try {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid request." };
    const { roomId, participantIdentity } = parsed.data;

    const [me, room] = await Promise.all([
      getCurrentUser(),
      prisma.room.findUnique({
        where: { id: roomId },
        select: { hostId: true, liveKitRoomName: true },
      }),
    ]);
    if (!me) return { success: false, error: "Not authenticated." };
    if (!room || room.hostId !== me.id) {
      return { success: false, error: "Only the host can mute participants." };
    }

    // Background: LiveKit mute. The guest's mic button and the grid badge
    // update through LiveKit itself, so no signal is needed.
    after(async () => {
      try {
        await retry(() => muteMicrophone(room.liveKitRoomName, participantIdentity), 2, 300);
      } catch (err) {
        console.error("[muteParticipant] Background error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[muteParticipant] Error:", err);
    return { success: false, error: "Could not mute this person." };
  }
}