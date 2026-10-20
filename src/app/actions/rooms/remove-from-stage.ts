// src/app/actions/rooms/remove-from-stage.ts
"use server";

import { after } from "next/server";
import { z } from "zod";

import prisma from "@/lib/clients/prisma-client";
import { getCurrentUser } from "@/lib/rooms/current-user.server";
import type { ActionResult } from "@/lib/rooms/room-events";
import {
  muteMicrophone,
  retry,
  sendRoomSignal,
  setParticipantRole,
} from "@/lib/rooms/room-signals.server";

const inputSchema = z.object({
  roomId: z.string().min(1),
  participantIdentity: z.string().min(1),
});

export async function removeFromStage(
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
      return { success: false, error: "Only the host can remove speakers." };
    }
    if (participantIdentity === room.hostId) {
      return { success: false, error: "The host cannot be moved." };
    }

    // Awaited: a rejoin must come back as a listener, so the DB has to be right first
    await prisma.roomSpeakerRequest.updateMany({
      where: { roomId, userId: participantIdentity },
      data: { status: "DECLINED" },
    });

    // Background: mute, revoke publish permission, notify. Each step is isolated.
    after(async () => {
      try {
        await muteMicrophone(room.liveKitRoomName, participantIdentity);
      } catch (err) {
        console.warn("[removeFromStage] mute failed:", err);
      }
      try {
        await retry(() =>
          setParticipantRole(room.liveKitRoomName, participantIdentity, "listener"),
        );
      } catch (err) {
        console.error("[removeFromStage] demote failed:", err);
      }
      await sendRoomSignal(room.liveKitRoomName, { type: "MOVED_TO_AUDIENCE" }, [
        participantIdentity,
      ]);
    });

    return { success: true };
  } catch (err) {
    console.error("[removeFromStage] Error:", err);
    return { success: false, error: "Could not move this person." };
  }
}