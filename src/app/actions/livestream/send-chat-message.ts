// src/app/actions/livestream/send-chat-message.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/clients/prisma-client";
import { ChatEventPayload, LIVE_TOPICS, MAX_CHAT_LENGTH } from "@/lib/livestream/live-stream-events";
import { allowAction, broadcastToRoom } from "@/lib/livestream/live-stream-server";


const inputSchema = z.object({
  streamId: z.string().min(1, "streamId is required"),
  text: z
    .string()
    .trim()
    .min(1, "Write a message first.")
    .max(MAX_CHAT_LENGTH, `Messages can be up to ${MAX_CHAT_LENGTH} characters.`),
});

export type SendChatInput = z.infer<typeof inputSchema>;

export type SendChatResult = { success: true } | { success: false; error: string };

export async function sendChatMessage(input: SendChatInput): Promise<SendChatResult> {
  try {
    /* ── 1. Auth + validation ── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const { streamId, text } = parsed.data;

    if (!allowAction(`chat:${clerkUserId}`, 700)) {
      return { success: false, error: "You're sending messages too fast." };
    }

    /* ── 2. Load sender + stream ── */
    const [sender, stream] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, name: true, imageUrl: true, profileImageUrl: true },
      }),
      prisma.liveStream.findUnique({
        where: { id: streamId },
        select: { status: true, hostId: true, liveKitRoomName: true },
      }),
    ]);

    if (!sender) return { success: false, error: "User not found." };
    if (!stream) return { success: false, error: "Stream not found." };
    if (stream.status !== "LIVE") return { success: false, error: "This stream has ended." };

    /* ── 3. Respect the host's block list ── */
    if (stream.hostId !== sender.id) {
      const blocked = await prisma.userBlock.findUnique({
        where: {
          blockedById_blockedUserId: { blockedById: stream.hostId, blockedUserId: sender.id },
        },
        select: { id: true },
      });
      if (blocked) return { success: false, error: "You can't chat in this stream." };
    }

    /* ── 4. Broadcast from the server (identity can't be spoofed) ── */
    const payload: ChatEventPayload = {
      id: crypto.randomUUID(),
      senderId: sender.id,
      senderName: sender.name,
      senderImage: sender.profileImageUrl ?? sender.imageUrl ?? null,
      text,
      createdAt: new Date().toISOString(),
    };

    const ok = await broadcastToRoom(stream.liveKitRoomName, LIVE_TOPICS.chat, payload);
    if (!ok) return { success: false, error: "Message couldn't be delivered. Try again." };

    return { success: true };
  } catch (err) {
    console.error("[sendChatMessage] Error:", err);
    return { success: false, error: "Failed to send message." };
  }
}