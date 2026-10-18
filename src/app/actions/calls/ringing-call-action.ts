// src/lib/actions/calls/ringing-call-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { revalidateCallParticipants } from "@/lib/cache-keys";
import {
  createLiveKitRoom,
  deleteLiveKitRoom,
  generateCallRoomName,
} from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";
import { sendIncomingCallPush } from "@/lib/push/send-incoming-call-push";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const RINGING_TIMEOUT_SECONDS = 40;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  receiverId: z.string().min(1, "receiverId is required"),
});

export type RingingCallInput = z.infer<typeof inputSchema>;

export type RingingCallResult =
  | {
      success: true;
      callId: string;
      callerId: string;
      receiverId: string;
      callerClerkId: string;
      receiverClerkId: string;
      liveKitRoomName: string;
      createdAt: string;
    }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  ringingCall — Server Action                                                */
/* -------------------------------------------------------------------------- */

export async function ringingCall(
  input: RingingCallInput,
): Promise<RingingCallResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success)
      return { success: false, error: "Invalid receiver ID." };

    const { receiverId } = parsed.data;

    /* ── 2. Parallel Fetch (Users + Checks + Cleanup) ─────── */
    // ⚡ SPEED: Run all independent DB queries at the same time.
    const [caller, receiver, block, activeCall] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: {
          id: true,
          clerkUserId: true,
          name: true,
          profileImageUrl: true,
          imageUrl: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        select: {
          id: true,
          clerkUserId: true,
          name: true,
        },
      }),
      prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockedById: clerkUserId, blockedUserId: receiverId },
            { blockedById: receiverId, blockedUserId: clerkUserId },
          ],
        },
        select: { id: true },
      }),
      prisma.call.findFirst({
        where: {
          status: { in: ["RINGING", "ACCEPTED"] },
          OR: [
            { callerId: clerkUserId },
            { receiverId: clerkUserId },
            { callerId: receiverId },
            { receiverId: receiverId },
          ],
        },
        // ✅ FIXED: Added receiverId to the select clause
        select: { id: true, status: true, callerId: true, receiverId: true },
      }),
      cleanupStaleCallsForUser(clerkUserId), // Fire and forget cleanup
    ]);

    if (!caller) return { success: false, error: "Caller not found." };
    if (!receiver) return { success: false, error: "Receiver not found." };
    if (caller.id === receiver.id) {
      return { success: false, error: "You cannot call yourself." };
    }

    if (block) return { success: false, error: "Cannot call this user." };

    if (activeCall) {
      const isMe =
        activeCall.callerId === caller.id || activeCall.receiverId === caller.id;
      return {
        success: false,
        error: isMe
          ? "You're already on a call or have one ringing."
          : `${receiver.name} is currently busy. Please try again.`,
      };
    }

    /* ── 3. Create Call Row ───────────────────────────────── */
    const tempRoomName = `pending-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    const call = await prisma.call.create({
      data: {
        callerId: caller.id,
        receiverId: receiver.id,
        liveKitRoomName: tempRoomName,
        status: "RINGING",
      },
      select: { id: true, createdAt: true },
    });

    const liveKitRoomName = generateCallRoomName(call.id);

    // ⚡ SPEED: Update the room name in the background.
    prisma.call
      .update({
        where: { id: call.id },
        data: { liveKitRoomName },
      })
      .catch((err) => console.error("[ringingCall] Room name update failed:", err));

    /* ── 4. Fire Background Tasks & Return Instantly ──────── */
    const callerAvatar = caller.profileImageUrl ?? caller.imageUrl ?? null;

    // Background Task A: Create LiveKit Room
    createLiveKitRoom({
      name: liveKitRoomName,
      emptyTimeout: 60 * 5,
      maxParticipants: 2,
    }).catch((err) => {
      console.error("[ringingCall] LiveKit room creation failed:", err);
    });

    // Background Task B: Create DB Notification
    prisma.notification
      .create({
        data: {
          userId: receiver.id,
          type: "INCOMING_CALL",
          title: "Incoming call",
          body: `${caller.name} is calling you`,
          data: {
            callId: call.id,
            callerId: caller.id,
            callerName: caller.name,
            callerAvatar,
          },
        },
      })
      .catch((err) => console.error("[ringingCall] Notif create failed:", err));

    // Background Task C: Send Web Push
    sendIncomingCallPush({
      receiverId: receiver.id,
      callId: call.id,
      callerId: caller.id,
      callerName: caller.name,
      callerAvatar,
      callerClerkId: caller.clerkUserId,
    }).catch((err) => console.error("[ringingCall] Push failed:", err));

    // Background Task D: Revalidate caches
    revalidateCallParticipants(caller.clerkUserId, receiver.clerkUserId);

    // ⚡ RETURN INSTANTLY
    return {
      success: true,
      callId: call.id,
      callerId: caller.id,
      receiverId: receiver.id,
      callerClerkId: caller.clerkUserId,
      receiverClerkId: receiver.clerkUserId,
      liveKitRoomName,
      createdAt: call.createdAt.toISOString(),
    };
  } catch (err) {
    console.error("[ringingCall] Error:", err);
    return { success: false, error: "Failed to initiate call." };
  }
}

/* -------------------------------------------------------------------------- */
/*  Layer 2 — Cleanup helper                                                   */
/* -------------------------------------------------------------------------- */

async function cleanupStaleCallsForUser(userId: string): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - RINGING_TIMEOUT_SECONDS * 1000);

    const stale = await prisma.call.findMany({
      where: {
        status: "RINGING",
        createdAt: { lt: cutoff },
        OR: [{ callerId: userId }, { receiverId: userId }],
      },
      select: { id: true, liveKitRoomName: true },
    });

    if (stale.length === 0) return;

    const ids = stale.map((c) => c.id);

    await prisma.call.updateMany({
      where: { id: { in: ids } },
      data: { status: "MISSED", endedAt: new Date(), endReason: "no_answer" },
    });

    for (const c of stale) {
      deleteLiveKitRoom(c.liveKitRoomName).catch(() => {});
    }
  } catch (err) {
    console.error("[ringingCall] Layer 2 cleanup failed:", err);
  }
}