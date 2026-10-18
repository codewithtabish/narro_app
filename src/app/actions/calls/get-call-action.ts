// src/lib/actions/calls/get-call-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  callId: z.string().min(1, "callId is required"),
});

export type GetCallInput = z.infer<typeof inputSchema>;

export type CallStatusValue =
  | "RINGING"
  | "ACCEPTED"
  | "REJECTED"
  | "MISSED"
  | "CANCELLED"
  | "ENDED";

export interface CallState {
  id: string;
  status: CallStatusValue;
  myRole: "caller" | "receiver";
  callerId: string;
  receiverId: string;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  endReason: string | null;
}

export type GetCallResult =
  | { success: true; call: CallState }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  getCall — read current state of a call                                     */
/* -------------------------------------------------------------------------- */
export async function getCall(input: GetCallInput): Promise<GetCallResult> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid call ID." };

    const { callId } = parsed.data;

    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) return { success: false, error: "User not found." };

    const call = await prisma.call.findUnique({
      where: { id: callId },
      select: {
        id: true,
        status: true,
        callerId: true,
        receiverId: true,
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
        endReason: true,
      },
    });

    if (!call) return { success: false, error: "Call not found." };

    if (call.callerId !== me.id && call.receiverId !== me.id) {
      return { success: false, error: "You are not a participant." };
    }

    const myRole: "caller" | "receiver" =
      call.callerId === me.id ? "caller" : "receiver";

    return {
      success: true,
      call: {
        id: call.id,
        status: call.status,
        myRole,
        callerId: call.callerId,
        receiverId: call.receiverId,
        startedAt: call.startedAt?.toISOString() ?? null,
        endedAt: call.endedAt?.toISOString() ?? null,
        durationSeconds: call.durationSeconds,
        endReason: call.endReason,
      },
    };
  } catch (err) {
    console.error("[getCall] Error:", err);
    return { success: false, error: "Failed to load call." };
  }
}