// src/app/actions/calls/get-incoming-call.ts
"use server";

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/clients/prisma-client";

const RINGING_TIMEOUT_SECONDS = 40;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface IncomingCall {
  callId: string;
  liveKitRoomName: string;
  createdAt: string;
  caller: {
    id: string;
    clerkUserId: string;
    name: string;
    imageUrl: string | null;
    profileImageUrl: string | null;
  };
}

export type GetIncomingCallResult =
  | { success: true; call: IncomingCall | null }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  getIncomingCall — Server Action                                            */
/* -------------------------------------------------------------------------- */

export async function getIncomingCall(): Promise<GetIncomingCallResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const cutoff = new Date(Date.now() - RINGING_TIMEOUT_SECONDS * 1000);

    /* ── 2. Single DB Query (Relational Filter) ───────────── */
    // ⚡ SPEED: We no longer query `User` first. We search the `Call`
    // table directly using the relational link to `User` (clerkUserId).
    // This cuts the database time in half.
    const call = await prisma.call.findFirst({
      where: {
        status: "RINGING",
        createdAt: { gte: cutoff },
        receiver: {
          clerkUserId: clerkUserId, // Filter directly by the Clerk ID
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        liveKitRoomName: true,
        createdAt: true,
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
    });

    if (!call) return { success: true, call: null };

    /* ── 3. Return instantly ──────────────────────────────── */
    return {
      success: true,
      call: {
        callId: call.id,
        liveKitRoomName: call.liveKitRoomName,
        createdAt: call.createdAt.toISOString(),
        caller: call.caller,
      },
    };
  } catch (err) {
    console.error("[getIncomingCall] Error:", err);
    return { success: false, error: "Failed to check incoming call." };
  }
}