// src/lib/push/send-call-ended-push.ts
import "server-only";

import prisma from "@/lib/clients/prisma-client";
import { sendPushToSubscription } from "@/lib/push/web-push-client";

/* -------------------------------------------------------------------------- */
/*  sendCallEndedPush                                                          */
/* -------------------------------------------------------------------------- */
/**
 * Sends a SILENT push to the receiver's devices telling them the call
 * ended (caller cancelled, missed, etc.).
 *
 * "Silent" means:
 *   • The OS does NOT show a visible notification
 *   • The service worker still receives it
 *   • The SW broadcasts a CALL_ENDED message to all open tabs
 *
 * This replaces the polling loop that used to live in
 * incoming-call-listener.tsx (auto-dismiss effect).
 */
export async function sendCallEndedPush(params: {
  receiverId: string;
  callId: string;
  reason: "cancelled" | "missed" | "rejected";
}): Promise<void> {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: params.receiverId },
      select: { id: true, endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const payload = {
      title: "Call ended",
      body: "",
      tag: `call-ended:${params.callId}`,
      silent: true,
      data: {
        type: "CALL_ENDED",
        callId: params.callId,
        reason: params.reason,
      },
    };

    const expiredIds: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        const result = await sendPushToSubscription(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
        if (result.gone) expiredIds.push(sub.id);
      }),
    );

    if (expiredIds.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: expiredIds } },
      });
    }
  } catch (err) {
    console.error("[sendCallEndedPush] Error:", err);
  }
}