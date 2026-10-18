// src/lib/actions/calls/missed-call-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { revalidateCallParticipants } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const RINGING_TIMEOUT_SECONDS = 40;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  callId: z.string().min(1, "callId is required"),
});

export type MissedCallInput = z.infer<typeof inputSchema>;

export type MissedCallResult =
  | {
      success: true;
      callId: string;
      callerId: string;
      receiverId: string;
      callerClerkId: string;
      receiverClerkId: string;
      marked: boolean;
    }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  missedCall — Server Action                                                 */
/* -------------------------------------------------------------------------- */

export async function missedCall(
  input: MissedCallInput,
): Promise<MissedCallResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Not authenticated." };
    }

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid call ID." };
    }

    const { callId } = parsed.data;

    /* ── 2. Parallel Fetch (User + Call) ── */
    // ⚡ SPEED: Fetch both at the same time.
    const [me, call] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, clerkUserId: true },
      }),
      prisma.call.findUnique({
        where: { id: callId },
        select: {
          id: true,
          callerId: true,
          receiverId: true,
          status: true,
          createdAt: true,
          caller: { select: { clerkUserId: true } },
          receiver: { select: { clerkUserId: true } },
        },
      }),
    ]);

    if (!me) return { success: false, error: "User not found." };
    if (!call) return { success: false, error: "Call not found." };

    /* ── 3. Participant check ─────────────────────────────── */
    const isParticipant =
      call.callerId === me.id || call.receiverId === me.id;

    if (!isParticipant) {
      return {
        success: false,
        error: "You are not a participant in this call.",
      };
    }

    /* ── 4. Idempotent — only RINGING calls get marked ────── */
    if (call.status !== "RINGING") {
      return {
        success: true,
        callId: call.id,
        callerId: call.callerId,
        receiverId: call.receiverId,
        callerClerkId: call.caller.clerkUserId,
        receiverClerkId: call.receiver.clerkUserId,
        marked: false,
      };
    }

    /* ── 5. Age check — must be ≥ 40s old ─────────────────── */
    const ageSeconds = Math.floor(
      (Date.now() - call.createdAt.getTime()) / 1000,
    );

    if (ageSeconds < RINGING_TIMEOUT_SECONDS) {
      return {
        success: true,
        callId: call.id,
        callerId: call.callerId,
        receiverId: call.receiverId,
        callerClerkId: call.caller.clerkUserId,
        receiverClerkId: call.receiver.clerkUserId,
        marked: false,
      };
    }

    /* ── 6. Atomic flip RINGING → MISSED ──────────────────── */
    const now = new Date();

    const updateResult = await prisma.call.updateMany({
      where: { id: callId, status: "RINGING" },
      data: {
        status: "MISSED",
        endedAt: now,
        endReason: "no_answer",
      },
    });

    if (updateResult.count === 0) {
      return {
        success: true,
        callId: call.id,
        callerId: call.callerId,
        receiverId: call.receiverId,
        callerClerkId: call.caller.clerkUserId,
        receiverClerkId: call.receiver.clerkUserId,
        marked: false,
      };
    }

    /* ── 7. Fire Background Tasks & Return Instantly ──────── */
    // ⚡ SPEED: We do NOT await these. The client gets the success
    // response immediately, while the DB handles the rest.

    // Background Task A: Mark receiver's notification as read
    prisma.notification
      .updateMany({
        where: {
          userId: call.receiverId,
          type: "INCOMING_CALL",
          readAt: null,
          data: { path: ["callId"], equals: callId },
        },
        data: { readAt: now },
      })
      .catch((err) => console.error("[missedCall] Notif read err:", err));

    // Background Task B: Notify the caller
    prisma.notification
      .create({
        data: {
          userId: call.callerId,
          type: "MISSED_CALL",
          title: "Missed call",
          body: "No answer",
          data: {
            callId: call.id,
            receiverId: call.receiverId,
          },
        },
      })
      .catch((err) => console.error("[missedCall] Notif create err:", err));

    // Background Task C: Revalidate caches
    revalidateCallParticipants(
      call.caller.clerkUserId,
      call.receiver.clerkUserId,
    );

    /* ── 8. Return Instantly ──────────────────────────────── */
    return {
      success: true,
      callId: call.id,
      callerId: call.callerId,
      receiverId: call.receiverId,
      callerClerkId: call.caller.clerkUserId,
      receiverClerkId: call.receiver.clerkUserId,
      marked: true,
    };
  } catch (err) {
    console.error("[missedCall] Error:", err);
    return { success: false, error: "Failed to mark call as missed." };
  }
}