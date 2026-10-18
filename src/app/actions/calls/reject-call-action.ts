// src/app/actions/calls/reject-call-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";

import { revalidateCallParticipants } from "@/lib/cache-keys";
import { deleteLiveKitRoom } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type RejectCallResult =
  | { success: true; callId: string }
  | {
      success: false;
      error:
        | "NOT_AUTHENTICATED"
        | "INVALID_CALL_ID"
        | "USER_NOT_FOUND"
        | "CALL_NOT_FOUND"
        | "FORBIDDEN"
        | "CALL_NO_LONGER_AVAILABLE"
        | "DATABASE_ERROR";
      message: string;
    };

/* -------------------------------------------------------------------------- */
/*  Reject call                                                                */
/* -------------------------------------------------------------------------- */

export async function rejectCallAction(
  callId: string,
): Promise<RejectCallResult> {
  try {
    /* ── 1. Auth ── */
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: "NOT_AUTHENTICATED",
        message: "Please sign in to continue.",
      };
    }

    if (
      typeof callId !== "string" ||
      !callId.trim() ||
      callId.trim().length > 128
    ) {
      return {
        success: false,
        error: "INVALID_CALL_ID",
        message: "A valid call is required.",
      };
    }

    const id = callId.trim();

    /* ── 2. Parallel Fetch (User + Call) ── */
    const [me, call] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, clerkUserId: true },
      }),
      prisma.call.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          callerId: true,
          receiverId: true,
          liveKitRoomName: true,
          caller: { select: { clerkUserId: true } },
        },
      }),
    ]);

    if (!me) {
      return {
        success: false,
        error: "USER_NOT_FOUND",
        message: "Your account could not be found.",
      };
    }

    if (!call) {
      return {
        success: false,
        error: "CALL_NOT_FOUND",
        message: "This call could not be found.",
      };
    }

    if (call.receiverId !== me.id) {
      return {
        success: false,
        error: "FORBIDDEN",
        message: "You can't decline this call.",
      };
    }

    /* ── 3. Fire Background Notification Cleanup ── */
    // ⚡ SPEED: Don't await this. It runs in the background.
    prisma.notification
      .updateMany({
        where: {
          userId: me.id,
          type: "INCOMING_CALL",
          readAt: null,
          data: { path: ["callId"], equals: call.id },
        },
        data: { readAt: new Date() },
      })
      .catch((err) => console.error("[rejectCallAction] Notif err:", err));

    /* ── 4. Atomic RINGING → REJECTED ── */
    const updated = await prisma.call.updateMany({
      where: { id: call.id, receiverId: me.id, status: "RINGING" },
      data: {
        status: "REJECTED",
        endedAt: new Date(),
        endReason: "REJECTED_BY_RECEIVER",
      },
    });

    if (updated.count === 0) {
      // If it wasn't RINGING (e.g., caller already cancelled), just exit gracefully.
      return {
        success: false,
        error: "CALL_NO_LONGER_AVAILABLE",
        message: "This call is no longer ringing.",
      };
    }

    /* ── 5. Fire Background Tasks & Return Instantly ── */
    // ⚡ SPEED: LiveKit room deletion takes 1-2s. Do it in the background.
    deleteLiveKitRoom(call.liveKitRoomName).catch((err) =>
      console.error("[rejectCallAction] LiveKit delete err:", err),
    );

    // ⚡ SPEED: Revalidate in the background.
    revalidateCallParticipants(call.caller.clerkUserId, me.clerkUserId);

    // The moment the DB says REJECTED, we tell the UI to close.
    return { success: true, callId: call.id };
  } catch (error) {
    console.error("[rejectCallAction]", error);

    return {
      success: false,
      error: "DATABASE_ERROR",
      message: "Failed to decline the call.",
    };
  }
}