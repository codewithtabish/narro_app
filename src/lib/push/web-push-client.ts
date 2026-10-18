// src/lib/push/web-push-client.ts
import "server-only";

import webpush, {
    type PushSubscription as WebPushSubscription,
} from "web-push";

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
  throw new Error(
    "[web-push-client] Missing VAPID env vars. Required: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT",
  );
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface PushPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  actions?: { action: string; title: string }[];
}

export interface SendResult {
  ok: boolean;
  /** true if the subscription is gone (404/410) — caller should delete it */
  gone: boolean;
  error?: string;
}

/* -------------------------------------------------------------------------- */
/*  sendPushToSubscription — send to ONE subscription                          */
/* -------------------------------------------------------------------------- */

export async function sendPushToSubscription(
  subscription: WebPushSubscription,
  payload: PushPayload,
): Promise<SendResult> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true, gone: false };
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };

    // 404 / 410 = subscription no longer exists — caller should delete it
    if (e.statusCode === 404 || e.statusCode === 410) {
      return { ok: false, gone: true, error: "Subscription expired" };
    }

    console.error("[web-push-client] sendNotification failed:", e);
    return { ok: false, gone: false, error: e.message ?? "Unknown error" };
  }
}