"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

export type ReceiverRecentCall = {
  id: string;
  direction: "INCOMING" | "OUTGOING";
  status: "RINGING" | "ACCEPTED" | "REJECTED" | "MISSED" | "ENDED" | "CANCELLED";
  durationSeconds: number;
  createdAt: Date;
};

export type ReceiverUser = {
  id: string;
  clerkUserId: string;
  name: string;
  imageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  languagesSpoken: string[];
  languagesLearning: string[];
  proficiencyByLanguage: Record<string, string>;
  interests: string[];
  status: "ONLINE" | "OFFLINE";
  isAvailable: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
  counts: { callsMade: number; callsReceived: number; totalCalls: number };
  recentCalls: ReceiverRecentCall[];
  isBlocked: boolean;
  isSelf: boolean; // 🔥 NEW: Tells the UI if this is the logged-in user's own profile
};

export type GetReceiverUserResult =
  | { success: true; user: ReceiverUser }
  | {
      success: false;
      error: "INVALID_RECEIVER_ID" | "USER_NOT_FOUND" | "DATABASE_ERROR";
      message: string;
    };

const RECENT_CALLS_LIMIT = 5;

async function getCachedReceiverUser(receiverClerkUserId: string) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.receiverUser(receiverClerkUserId));

  return prisma.user.findUnique({
    where: { clerkUserId: receiverClerkUserId },
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      imageUrl: true,
      profileImageUrl: true,
      bio: true,
      languagesSpoken: true,
      languagesLearning: true,
      proficiencyByLanguage: true,
      interests: true,
      status: true,
      isAvailable: true,
      lastSeenAt: true,
      createdAt: true,
      _count: {
        select: { callsAsCaller: true, callsAsReceiver: true },
      },
    },
  });
}

export async function getReceiverUserAction(
  receiverClerkUserId: string,
): Promise<GetReceiverUserResult> {
  try {
    const { userId: currentClerkUserId } = await auth();

    if (!receiverClerkUserId || receiverClerkUserId.length > 256) {
      return { success: false, error: "INVALID_RECEIVER_ID", message: "Invalid user ID." };
    }

    const targetClerkUserId = receiverClerkUserId.trim();

    // 🔥 REMOVED THE STRICT SELF-VIEWING BLOCK HERE 🔥
    // We calculate isSelf instead of throwing an error
    const isSelf = currentClerkUserId === targetClerkUserId;

    const receiver = await getCachedReceiverUser(targetClerkUserId);

    if (!receiver) {
      return { success: false, error: "USER_NOT_FOUND", message: "User not found." };
    }

    let recentCalls: ReceiverRecentCall[] = [];
    let isBlocked = false;

    // If the viewer is logged in, check for blocks and recent calls
    if (currentClerkUserId && !isSelf) {
      const currentUser = await prisma.user.findUnique({
        where: { clerkUserId: currentClerkUserId },
        select: { id: true },
      });

      if (currentUser) {
        const block = await prisma.userBlock.findFirst({
          where: {
            OR: [
              { blockedById: currentUser.id, blockedUserId: receiver.id },
              { blockedById: receiver.id, blockedUserId: currentUser.id },
            ],
          },
          select: { id: true },
        });

        if (block) {
          isBlocked = true;
        } else {
          const callRows = await prisma.call.findMany({
            where: {
              OR: [
                { callerId: currentUser.id, receiverId: receiver.id },
                { callerId: receiver.id, receiverId: currentUser.id },
              ],
            },
            orderBy: { createdAt: "desc" },
            take: RECENT_CALLS_LIMIT,
            select: { id: true, callerId: true, status: true, durationSeconds: true, createdAt: true },
          });

          recentCalls = callRows.map((call) => ({
            id: call.id,
            direction: call.callerId === currentUser.id ? "OUTGOING" : "INCOMING",
            status: call.status,
            durationSeconds: call.durationSeconds,
            createdAt: call.createdAt,
          }));
        }
      }
    }

    const callsMade = receiver._count.callsAsCaller;
    const callsReceived = receiver._count.callsAsReceiver;

    return {
      success: true,
      user: {
        id: receiver.id,
        clerkUserId: receiver.clerkUserId,
        name: receiver.name,
        imageUrl: receiver.imageUrl,
        profileImageUrl: receiver.profileImageUrl,
        bio: receiver.bio,
        languagesSpoken: receiver.languagesSpoken,
        languagesLearning: receiver.languagesLearning,
        proficiencyByLanguage: (receiver.proficiencyByLanguage as Record<string, string> | null) ?? {},
        interests: receiver.interests,
        status: receiver.status,
        isAvailable: receiver.isAvailable,
        lastSeenAt: receiver.lastSeenAt,
        createdAt: receiver.createdAt,
        counts: { callsMade, callsReceived, totalCalls: callsMade + callsReceived },
        recentCalls,
        isBlocked,
        isSelf,
      },
    };
  } catch (error) {
    console.error("[getReceiverUserAction] Error:", error);
    return { success: false, error: "DATABASE_ERROR", message: "Failed to load receiver profile." };
  }
}