// src/app/actions/chat/send-message.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { z } from "zod";

import { revalidateUserChats } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  chatId: z.string().min(1),
  text: z.string().trim().min(1).max(1000),
});

export async function sendMessage(input: z.infer<typeof inputSchema>) {
  try {
    /* ── 1. Auth & Validation (Instant) ── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid message." };
    const { chatId, text } = parsed.data;

    /* ── 2. Verify Participation (Fast DB Check) ── */
    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) return { success: false, error: "User not found." };

    const chat = await prisma.chatConversation.findFirst({
      where: {
        id: chatId,
        OR: [{ userOneId: me.id }, { userTwoId: me.id }],
      },
      include: {
        userOne: { select: { clerkUserId: true } },
        userTwo: { select: { clerkUserId: true } },
      },
    });

    if (!chat) return { success: false, error: "Chat not found." };

    /* ── 3. Fire and Forget (after) ── */
    // ✅ SPEED: The client gets `success: true` instantly.
    // The DB write and cache clear happen completely in the background.
    after(async () => {
      try {
        // Save the message to Postgres
        await prisma.message.create({
          data: {
            chatId,
            senderId: me.id,
            text,
          },
        });

        // Update the timestamp so the chat moves to the top of the inbox
        await prisma.chatConversation.update({
          where: { id: chatId },
          data: { lastMessageAt: new Date() },
        });

        // Clear the `userChats` cache for both participants
        revalidateUserChats([chat.userOne.clerkUserId, chat.userTwo.clerkUserId]);
      } catch (err) {
        console.error("[sendMessage] Background error:", err);
      }
    });

    /* ── 4. Return Instantly ── */
    return { success: true };
  } catch (err) {
    console.error("[sendMessage] Error:", err);
    return { success: false, error: "Failed to send message." };
  }
}