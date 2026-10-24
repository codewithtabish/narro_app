// src/app/actions/chat/get-messages.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

export type ChatMessage = {
  id: string;
  text: string;
  isMe: boolean;
  createdAt: string;
};

export type GetMessagesResult =
  | {
      success: true;
      chat: {
        id: string;
        receiver: {
          id: string;
          name: string;
          image: string | null;
        };
      };
      messages: ChatMessage[];
    }
  | { success: false; error: string };

const MAX_MESSAGES = 100;

export async function getMessages(chatId?: string, receiverClerkId?: string): Promise<GetMessagesResult> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    return await fetchCachedMessages(chatId, receiverClerkId, clerkUserId);
  } catch (err) {
    console.error("[getMessages] Outer Error:", err);
    return { success: false, error: "Failed to load messages." };
  }
}

async function fetchCachedMessages(
  chatId: string | undefined, 
  receiverClerkId: string | undefined, 
  clerkUserId: string
): Promise<GetMessagesResult> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.userChats(clerkUserId));

  try {
    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) return { success: false, error: "User not found." };

    let chat;

    // 1. Fetch existing chat
    if (chatId) {
      chat = await prisma.chatConversation.findFirst({
        where: {
          id: chatId,
          OR: [{ userOneId: me.id }, { userTwoId: me.id }],
        },
        include: {
          userOne: { select: { id: true, name: true, imageUrl: true, profileImageUrl: true } },
          userTwo: { select: { id: true, name: true, imageUrl: true, profileImageUrl: true } },
        },
      });
    } 
    // 2. Or find/create a chat with the receiver
    else if (receiverClerkId) {
      const receiver = await prisma.user.findUnique({
        where: { clerkUserId: receiverClerkId },
        select: { id: true, name: true, imageUrl: true, profileImageUrl: true },
      });
      if (!receiver) return { success: false, error: "Receiver not found." };

      chat = await prisma.chatConversation.findFirst({
        where: {
          OR: [
            { userOneId: me.id, userTwoId: receiver.id },
            { userOneId: receiver.id, userTwoId: me.id },
          ],
        },
        include: {
          userOne: { select: { id: true, name: true, imageUrl: true, profileImageUrl: true } },
          userTwo: { select: { id: true, name: true, imageUrl: true, profileImageUrl: true } },
        },
      });

      if (!chat) {
        chat = await prisma.chatConversation.create({
          data: {
            userOneId: me.id,
            userTwoId: receiver.id,
            firebaseChatId: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          },
          include: {
            userOne: { select: { id: true, name: true, imageUrl: true, profileImageUrl: true } },
            userTwo: { select: { id: true, name: true, imageUrl: true, profileImageUrl: true } },
          },
        });
      }
    }

    if (!chat) return { success: false, error: "Chat not found." };

    const receiver = chat.userOneId === me.id ? chat.userTwo : chat.userOne;

    const dbMessages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
      take: MAX_MESSAGES,
      select: {
        id: true,
        text: true,
        senderId: true,
        createdAt: true,
      },
    });

    const messages: ChatMessage[] = dbMessages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      isMe: msg.senderId === me.id,
      createdAt: msg.createdAt.toISOString(),
    }));

    return {
      success: true,
      chat: {
        id: chat.id,
        receiver: {
          id: receiver.id,
          name: receiver.name,
          image: receiver.profileImageUrl ?? receiver.imageUrl,
        }
      },
      messages,
    };
  } catch (error) {
    // ✅ This will print the EXACT Prisma error in your terminal
    console.error("[getMessages] Prisma Query Error:", error);
    return { success: false, error: "Failed to load messages." };
  }
}