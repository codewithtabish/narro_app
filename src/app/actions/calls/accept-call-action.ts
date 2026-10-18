// src/app/actions/calls/accept-call-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";

import { revalidateCallParticipants } from "@/lib/cache-keys";
import { createLiveKitToken } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type AcceptCallResult =
  | {
      success: true;
      call: {
        id: string;
        roomName: string;
        status: "ACCEPTED";
        caller: {
          id: string;
          clerkUserId: string;
          name: string;
          imageUrl: string | null;
        };
      };
      token: string;
      livekitUrl: string;
    }
  | {
      success: false;
      error:
        | "NOT_AUTHENTICATED"
        | "INVALID_CALL_ID"
        | "USER_NOT_FOUND"
        | "CALL_NOT_FOUND"
        | "FORBIDDEN"
        | "CALL_EXPIRED"
        | "CALL_NO_LONGER_AVAILABLE"
        | "LIVEKIT_ERROR"
        | "DATABASE_ERROR";
      message: string;
    };

/** Small grace window on top of the 45s ring timeout (network delay). */
const ACCEPT_WINDOW_SECONDS = 60;

/* -------------------------------------------------------------------------- */
/*  Accept call                                                                */
/* -------------------------------------------------------------------------- */

export async function acceptCallAction(
  callId: string,
): Promise<AcceptCallResult> {
  try {
    /* ── 1. Auth ── */
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: "NOT_AUTHENTICATED",
        message: "Please sign in to answer calls.",
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
    // ⚡ SPEED: Fetching user and call at the exact same time.
    const [me, call] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, clerkUserId: true, name: true },
      }),
      prisma.call.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          createdAt: true,
          liveKitRoomName: true,
          callerId: true,
          receiverId: true,
          caller: {
            select: {
              id: true,
              clerkUserId: true,
              name: true,
              imageUrl: true,
              profileImageUrl: true,
            },
          },
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
        message: "You can't answer this call.",
      };
    }

    /* ── 3. Fast Background Notification Cleanup ── */
    // ⚡ SPEED: Fire and forget. We don't wait for this DB write.
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
      .catch((err) => console.error("[acceptCallAction] Notif update err:", err));

    /* ── 4. Status Checks ── */
    const alreadyAccepted = call.status === "ACCEPTED";

    if (!alreadyAccepted && call.status !== "RINGING") {
      return {
        success: false,
        error: "CALL_NO_LONGER_AVAILABLE",
        message: "This call has already ended.",
      };
    }

    if (!alreadyAccepted) {
      const ageSeconds = (Date.now() - call.createdAt.getTime()) / 1000;

      if (ageSeconds > ACCEPT_WINDOW_SECONDS) {
        // Fire and forget the missed update
        prisma.call
          .updateMany({
            where: { id: call.id, status: "RINGING" },
            data: {
              status: "MISSED",
              endedAt: new Date(),
              endReason: "RING_TIMEOUT",
            },
          })
          .catch((err) => console.error("[acceptCallAction] Missed update err:", err));

        return {
          success: false,
          error: "CALL_EXPIRED",
          message: "This call was missed.",
        };
      }

      /* ── 5. Atomic RINGING → ACCEPTED ── */
      const updated = await prisma.call.updateMany({
        where: { id: call.id, receiverId: me.id, status: "RINGING" },
        data: { status: "ACCEPTED", startedAt: new Date() },
      });

      if (updated.count === 0) {
        return {
          success: false,
          error: "CALL_NO_LONGER_AVAILABLE",
          message: "The caller hung up before you answered.",
        };
      }
    }

    /* ── 6. Parallel: LiveKit Token + Revalidation ── */
    // ⚡ SPEED: We do the LiveKit token generation and the cache revalidation
    // at the exact same time.
    let token: string;
    try {
      [token] = await Promise.all([
        createLiveKitToken({
          roomName: call.liveKitRoomName,
          participantId: me.id,
          participantName: me.name,
          ttl: 60 * 60,
        }),
        revalidateCallParticipants(call.caller.clerkUserId, me.clerkUserId),
      ]);
    } catch (error) {
      console.error("[acceptCallAction] LiveKit token failure", error);
      return {
        success: false,
        error: "LIVEKIT_ERROR",
        message: "Couldn't connect the call. Please try again.",
      };
    }

    /* ── 7. Return Instantly ── */
    return {
      success: true,
      call: {
        id: call.id,
        roomName: call.liveKitRoomName,
        status: "ACCEPTED",
        caller: {
          id: call.caller.id,
          clerkUserId: call.caller.clerkUserId,
          name: call.caller.name,
          imageUrl: call.caller.profileImageUrl ?? call.caller.imageUrl,
        },
      },
      token,
      livekitUrl:
        process.env.NEXT_PUBLIC_LIVEKIT_URL ?? process.env.LIVEKIT_URL ?? "",
    };
  } catch (error) {
    console.error("[acceptCallAction]", error);

    return {
      success: false,
      error: "DATABASE_ERROR",
      message: "Failed to answer the call.",
    };
  }
}