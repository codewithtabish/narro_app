// src/app/actions/livestream/send-reaction.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/clients/prisma-client";
import { LIVE_TOPICS, ReactionEventPayload } from "@/lib/livestream/live-stream-events";
import { allowAction, broadcastToRoom } from "@/lib/livestream/live-stream-server";

const inputSchema = z.object({
  streamId: z.string().min(1),
  count: z.number().int().min(1).max(5),
});

export type SendReactionInput = z.infer<typeof inputSchema>;
export type SendReactionResult = { success: true } | { success: false; error: string };

export async function sendReaction(input: SendReactionInput): Promise<SendReactionResult> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid reaction." };
    const { streamId, count } = parsed.data;

    if (!allowAction(`react:${clerkUserId}`, 400)) {
      return { success: false, error: "Too fast." };
    }

    const [me, stream] = await Promise.all([
      prisma.user.findUnique({ where: { clerkUserId }, select: { id: true } }),
      prisma.liveStream.findUnique({
        where: { id: streamId },
        select: { status: true, liveKitRoomName: true },
      }),
    ]);

    if (!me) return { success: false, error: "User not found." };
    if (!stream || stream.status !== "LIVE") return { success: false, error: "Stream ended." };

    const payload: ReactionEventPayload = { id: crypto.randomUUID(), senderId: me.id, count };
    await broadcastToRoom(stream.liveKitRoomName, LIVE_TOPICS.reaction, payload);

    return { success: true };
  } catch (err) {
    console.error("[sendReaction] Error:", err);
    return { success: false, error: "Failed to send reaction." };
  }
}