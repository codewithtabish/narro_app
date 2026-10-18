// src/lib/actions/calls/end-call-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { revalidateCallParticipants } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  callId: z.string().min(1, "callId is required"),
});

export type EndCallInput = z.infer<typeof inputSchema>;

export type EndCallResult =
  | {
      success: true;
      callId: string;
      callerId: string;
      receiverId: string;
      callerClerkId: string;
      receiverClerkId: string;
      durationSeconds: number;
      endedAt: string;
    }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  endCall — Server Action                                                    */
/* -------------------------------------------------------------------------- */

export async function endCall(input: EndCallInput): Promise<EndCallResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    /* ── 2. Validate ──────────────────────────────────────── */
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid call ID." };

    const { callId } = parsed.data;

    /* ── 3. Parallel Fetch (User + Call) ── */
    // ⚡ SPEED: Fetching both at the exact same time saves ~100ms.
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
          startedAt: true,
          caller: { select: { clerkUserId: true } },
          receiver: { select: { clerkUserId: true } },
        },
      }),
    ]);

    if (!me) return { success: false, error: "User not found." };
    if (!call) return { success: false, error: "Call not found." };

    /* ── 4. Participant check ─────────────────────────────── */
    const isParticipant =
      call.callerId === me.id || call.receiverId === me.id;
    if (!isParticipant) {
      return {
        success: false,
        error: "You are not a participant in this call.",
      };
    }

    /* ── 5. Only ACCEPTED can be ended ────────────────────── */
    if (call.status !== "ACCEPTED") {
      // If it's already ended (e.g. double click), just silently succeed.
      if (call.status === "ENDED") {
        return {
          success: true,
          callId: call.id,
          callerId: call.callerId,
          receiverId: call.receiverId,
          callerClerkId: call.caller.clerkUserId,
          receiverClerkId: call.receiver.clerkUserId,
          durationSeconds: 0, // It was already ended
          endedAt: new Date().toISOString(),
        };
      }
      return {
        success: false,
        error: `Call cannot be ended (status: ${call.status}).`,
      };
    }

    /* ── 6. Compute duration ──────────────────────────────── */
    const now = new Date();
    const startedAt = call.startedAt ?? now;
    const durationSeconds = Math.max(
      0,
      Math.floor((now.getTime() - startedAt.getTime()) / 1000),
    );

    /* ── 7. UPDATE Call ───────────────────────────────────── */
    await prisma.call.update({
      where: { id: callId },
      data: {
        status: "ENDED",
        endedAt: now,
        durationSeconds,
        endReason: "user_ended",
      },
    });

    /* ── 8. Fire Background Tasks & Return Instantly ──────── */
    // ⚡ SPEED: We do NOT await these. The user leaves the room immediately,
    // and the server cleans up the database and cache in the background.

    // Background Task A: Mark notification as read
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
      .catch((err) => console.error("[endCall] Notif err:", err));

    // Background Task B: Revalidate Cache
    revalidateCallParticipants(
      call.caller.clerkUserId,
      call.receiver.clerkUserId,
    );

    /* ── 9. Return Instantly ──────────────────────────────── */
    return {
      success: true,
      callId: call.id,
      callerId: call.callerId,
      receiverId: call.receiverId,
      callerClerkId: call.caller.clerkUserId,
      receiverClerkId: call.receiver.clerkUserId,
      durationSeconds,
      endedAt: now.toISOString(),
    };
  } catch (err) {
    console.error("[endCall] Error:", err);
    return { success: false, error: "Failed to end call." };
  }
}