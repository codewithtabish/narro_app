// src/lib/actions/push/subscribe-push.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

const inputSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type SubscribePushInput = z.infer<typeof inputSchema>;

export type SubscribePushResult =
  | { success: true }
  | { success: false; error: string };

/* -------------------------------------------------------------------------- */
/*  subscribePush — Server Action                                              */
/* -------------------------------------------------------------------------- */
/**
 * Saves a web push subscription for the current user.
 *
 * Called from the client (use-push-subscription hook) after the browser
 * has created a PushSubscription. Idempotent — same endpoint upserts.
 *
 * @param input - the browser's PushSubscription.toJSON()
 */
export async function subscribePush(
  input: SubscribePushInput,
): Promise<SubscribePushResult> {
  try {
    /* ── 1. Authenticate ──────────────────────────────────── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Not authenticated." };
    }

    /* ── 2. Validate ──────────────────────────────────────── */
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid subscription payload." };
    }

    /* ── 3. Load current user ─────────────────────────────── */
    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) {
      return { success: false, error: "User not found." };
    }

    /* ── 4. Upsert the subscription ───────────────────────── */
    const { endpoint, keys } = parsed.data;

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: me.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        userId: me.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("[subscribePush] Error:", err);
    return { success: false, error: "Failed to save subscription." };
  }
}