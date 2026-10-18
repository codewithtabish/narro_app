// src/lib/actions/calls/initiate-call.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { revalidateUser } from "@/lib/cache-keys";
import {
    createLiveKitRoom,
    generateCallRoomName,
} from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  receiverId: z.string().min(1, "receiverId is required"),
});

export type InitiateCallInput = z.infer<typeof inputSchema>;

export type InitiateCallResult =
  | {
      success: true;
      callId: string;
      callerId: string;
      receiverId: string;
      liveKitRoomName: string;
    }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  initiateCall — Server Action                                               */
/* -------------------------------------------------------------------------- */
/**
 * Called when User A clicks "Call" on User B's card.
 *
 * Steps:
 *   1.  Authenticate caller (Clerk)
 *   2.  Validate receiverId
 *   3.  Load caller from User table
 *   4.  Prevent self-call
 *   5.  Load receiver from User table
 *   6.  Verify receiver finished onboarding
 *   7.  Check for blocks (both directions)
 *   8.  Check for existing active call
 *   9.  INSERT Call row (status = RINGING)
 *   10. Create LiveKit room
 *   11. Finalize liveKitRoomName on the Call row
 *   12. INSERT Notification for receiver (type = INCOMING_CALL)
 *   13. Revalidate caches for BOTH caller + receiver
 *   14. Return callId + callerId + receiverId + liveKitRoomName
 *
 * Used by:
 *   - Web (direct Server Action call)
 *   - Mobile (via POST /api/calls/initiate, which wraps this action)
 */
export async function initiateCall(
  input: InitiateCallInput,
): Promise<InitiateCallResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, error: "Not authenticated." };
    }

    /* ── 2. Validate input ────────────────────────────────── */
    const parsed = inputSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid receiver ID." };
    }

    const { receiverId } = parsed.data;

    /* ── 3. Load caller ───────────────────────────────────── */
    const caller = await prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        clerkUserId: true,
        name: true,
        profileImageUrl: true,
        imageUrl: true,
        onboardingCompletedAt: true,
      },
    });

    if (!caller) {
      return { success: false, error: "Caller not found." };
    }

    if (!caller.onboardingCompletedAt) {
      return {
        success: false,
        error: "Please complete your onboarding first.",
      };
    }

    /* ── 4. Prevent self-call ─────────────────────────────── */
    if (caller.id === receiverId) {
      return { success: false, error: "You cannot call yourself." };
    }

    /* ── 5. Load receiver ─────────────────────────────────── */
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: {
        id: true,
        clerkUserId: true,
        name: true,
        onboardingCompletedAt: true,
      },
    });

    if (!receiver) {
      return { success: false, error: "Receiver not found." };
    }

    if (!receiver.onboardingCompletedAt) {
      return {
        success: false,
        error: "This user hasn't finished onboarding yet.",
      };
    }

    /* ── 6. Check blocking (both directions) ──────────────── */
    const block = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockedById: caller.id, blockedUserId: receiver.id },
          { blockedById: receiver.id, blockedUserId: caller.id },
        ],
      },
      select: { id: true },
    });

    if (block) {
      return { success: false, error: "Cannot call this user." };
    }

    /* ── 7. Prevent duplicate active calls ────────────────── */
    const activeCall = await prisma.call.findFirst({
      where: {
        status: { in: ["RINGING", "ACCEPTED"] },
        OR: [
          { callerId: caller.id, receiverId: receiver.id },
          { callerId: receiver.id, receiverId: caller.id },
        ],
      },
      select: { id: true },
    });

    if (activeCall) {
      return {
        success: false,
        error: "There's already an active call with this user.",
      };
    }

    /* ── 8. INSERT Call row ───────────────────────────────── */
    // Prisma @default(cuid()) generates the id, but we need the id
    // BEFORE we can build the deterministic liveKitRoomName.
    // Two-step: insert with temp name → update with real name.
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
      select: { id: true },
    });

    const liveKitRoomName = generateCallRoomName(call.id);

    /* ── 9. Create LiveKit room ───────────────────────────── */
    try {
      await createLiveKitRoom({
        name: liveKitRoomName,
        emptyTimeout: 60 * 5,
        maxParticipants: 2,
      });
    } catch (err) {
      console.error("[initiateCall] LiveKit room creation failed:", err);

      // Roll back the Call row so we don't leave an orphan RINGING call
      await prisma.call
        .delete({ where: { id: call.id } })
        .catch((delErr) =>
          console.error("[initiateCall] Rollback delete failed:", delErr),
        );

      return {
        success: false,
        error: "Failed to set up call room. Please try again.",
      };
    }

    /* ── 10. Finalize room name on the Call row ───────────── */
    await prisma.call.update({
      where: { id: call.id },
      data: { liveKitRoomName },
    });

    /* ── 11. INSERT Notification for receiver ─────────────── */
    const callerAvatar = caller.profileImageUrl ?? caller.imageUrl ?? null;

    await prisma.notification.create({
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
    });

    /* ── 12. Revalidate caches for BOTH users ─────────────── */
    // Caller's cache
    revalidateUser(caller.clerkUserId);

    // Receiver's cache
    revalidateUser(receiver.clerkUserId);

    /* ── 13. Return ───────────────────────────────────────── */
    return {
      success: true,
      callId: call.id,
      callerId: caller.id,
      receiverId: receiver.id,
      liveKitRoomName,
    };
  } catch (err) {
    console.error("[initiateCall] Error:", err);
    return { success: false, error: "Failed to initiate call." };
  }
}