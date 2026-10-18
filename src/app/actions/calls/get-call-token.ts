// src/lib/actions/calls/get-call-token.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { createLiveKitToken } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  callId: z.string().min(1, "callId is required"),
});

export type GetCallTokenInput = z.infer<typeof inputSchema>;

export type GetCallTokenResult =
  | {
      success: true;
      token: string;
      liveKitUrl: string;
      roomName: string;
      isCaller: boolean;
      otherParticipant: {
        name: string;
        imageUrl: string | null;
        profileImageUrl: string | null;
      };
    }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  getCallToken — Server Action                                               */
/* -------------------------------------------------------------------------- */

export async function getCallToken(
  input: GetCallTokenInput,
): Promise<GetCallTokenResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    /* ── 2. Validate ──────────────────────────────────────── */
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid call ID." };

    const { callId } = parsed.data;

    /* ── 3. Parallel Fetch (User + Call) ── */
    // ⚡ SPEED: Run both queries at the same time.
    const [me, call] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, name: true },
      }),
      prisma.call.findUnique({
        where: { id: callId },
        select: {
          id: true,
          callerId: true,
          receiverId: true,
          liveKitRoomName: true,
          status: true,
          caller: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              profileImageUrl: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              profileImageUrl: true,
            },
          },
        },
      }),
    ]);

    if (!me) return { success: false, error: "User not found." };
    if (!call) return { success: false, error: "Call not found." };

    /* ── 4. Participant check ─────────────────────────────── */
    const isCaller = call.callerId === me.id;
    const isReceiver = call.receiverId === me.id;

    if (!isCaller && !isReceiver) {
      return {
        success: false,
        error: "You are not a participant in this call.",
      };
    }

    /* ── 5. Status check ──────────────────────────────────── */
    if (call.status !== "ACCEPTED") {
      return {
        success: false,
        error: `Call is not active (status: ${call.status}).`,
      };
    }

    /* ── 6. Generate LiveKit token ────────────────────────── */
    const liveKitUrl = process.env.LIVEKIT_URL;
    if (!liveKitUrl) {
      return { success: false, error: "LiveKit URL not configured." };
    }

    // ⚡ SPEED: Generate token instantly. We already have `me` and `call`.
    const token = await createLiveKitToken({
      roomName: call.liveKitRoomName,
      participantId: me.id,
      participantName: me.name,
      ttl: 60 * 60, // 1 hour
    });

    /* ── 7. Figure out the other participant ──────────────── */
    const otherParticipant = isCaller ? call.receiver : call.caller;

    return {
      success: true,
      token,
      liveKitUrl,
      roomName: call.liveKitRoomName,
      isCaller,
      otherParticipant: {
        name: otherParticipant.name,
        imageUrl: otherParticipant.imageUrl,
        profileImageUrl: otherParticipant.profileImageUrl,
      },
    };
  } catch (err) {
    console.error("[getCallToken] Error:", err);
    return { success: false, error: "Failed to generate call token." };
  }
}