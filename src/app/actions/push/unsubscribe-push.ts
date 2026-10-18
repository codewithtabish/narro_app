// src/lib/actions/push/unsubscribe-push.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  endpoint: z.string().url(),
});

export type UnsubscribePushInput = z.infer<typeof inputSchema>;

export type UnsubscribePushResult =
  | { success: true }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  unsubscribePush — Server Action                                            */
/* -------------------------------------------------------------------------- */
/**
 * Removes a web push subscription for the current user.
 *
 * Only deletes if the subscription belongs to the current user
 * (prevents a user from deleting someone else's subscription by
 * passing an arbitrary endpoint).
 */
export async function unsubscribePush(
  input: UnsubscribePushInput,
): Promise<UnsubscribePushResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Not authenticated." };
    }

    /* ── 2. Validate ──────────────────────────────────────── */
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid payload." };
    }

    /* ── 3. Load current user ─────────────────────────────── */
    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) {
      return { success: false, error: "User not found." };
    }

    /* ── 4. Delete only if it belongs to this user ────────── */
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint: parsed.data.endpoint,
        userId: me.id,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("[unsubscribePush] Error:", err);
    return { success: false, error: "Failed to unsubscribe." };
  }
}