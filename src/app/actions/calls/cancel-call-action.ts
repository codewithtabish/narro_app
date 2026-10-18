// src/lib/actions/calls/cancel-call-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { revalidateCallParticipants } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { sendCallEndedPush } from "@/lib/push/send-call-ended-push";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  callId: z.string().min(1, "callId is required"),
});

export type CancelCallInput = z.infer<typeof inputSchema>;

export type CancelCallResult =
  | {
      success: true;
      callId: string;
      callerId: string;
      receiverId: string;
      callerClerkId: string;
      receiverClerkId: string;
    }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  cancelCall — Server Action                                                 */
/* -------------------------------------------------------------------------- */
export async function cancelCall(
  input: CancelCallInput,
): Promise<CancelCallResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    /* ── 2. Validate ──────────────────────────────────────── */
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid call ID." };

    const { callId } = parsed.data;

    /* ── 3. Load current user ─────────────────────────────── */
    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true, clerkUserId: true },
    });
    if (!me) return { success: false, error: "User not found." };

    /* ── 4. Load call ─────────────────────────────────────── */
    const call = await prisma.call.findUnique({
      where: { id: callId },
      select: {
        id: true,
        callerId: true,
        receiverId: true,
        status: true,
        caller: { select: { clerkUserId: true } },
        receiver: { select: { clerkUserId: true } },
      },
    });
    if (!call) return { success: false, error: "Call not found." };

    /* ── 5. Only caller can cancel ────────────────────────── */
    if (call.callerId !== me.id) {
      return {
        success: false,
        error: "Only the caller can cancel this call.",
      };
    }

    /* ── 6. Idempotent — already over → success ───────────── */
    if (
      call.status === "MISSED" ||
      call.status === "REJECTED" ||
      call.status === "CANCELLED" ||
      call.status === "ENDED"
    ) {
      return {
        success: true,
        callId: call.id,
        callerId: call.callerId,
        receiverId: call.receiverId,
        callerClerkId: call.caller.clerkUserId,
        receiverClerkId: call.receiver.clerkUserId,
      };
    }

    /* ── 7. ACCEPTED → wrong action ───────────────────────── */
    if (call.status === "ACCEPTED") {
      return {
        success: false,
        error: "This call is already in progress. Use End Call instead.",
      };
    }

    /* ── 8. Atomic UPDATE ─────────────────────────────────── */
    const now = new Date();

    const updateResult = await prisma.call.updateMany({
      where: { id: callId, status: "RINGING" },
      data: {
        status: "CANCELLED",
        endedAt: now,
        endReason: "caller_cancelled",
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
      };
    }

    /* ── 9. Mark receiver's INCOMING_CALL notif as read ───── */
    await prisma.notification.updateMany({
      where: {
        userId: call.receiverId,
        type: "INCOMING_CALL",
        readAt: null,
        data: { path: ["callId"], equals: callId },
      },
      data: { readAt: now },
    });

    /* ── 10. Silent push → tells receiver's tabs to close modal */
    await sendCallEndedPush({
      receiverId: call.receiverId,
      callId: call.id,
      reason: "cancelled",
    });

    /* ── 11. Revalidate ───────────────────────────────────── */
    revalidateCallParticipants(
      call.caller.clerkUserId,
      call.receiver.clerkUserId,
    );

    /* ── 12. Return ───────────────────────────────────────── */
    return {
      success: true,
      callId: call.id,
      callerId: call.callerId,
      receiverId: call.receiverId,
      callerClerkId: call.caller.clerkUserId,
      receiverClerkId: call.receiver.clerkUserId,
    };
  } catch (err) {
    console.error("[cancelCall] Error:", err);
    return { success: false, error: "Failed to cancel call." };
  }
}