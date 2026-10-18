// src/lib/push/send-incoming-call-push.ts
import "server-only";

import prisma from "@/lib/clients/prisma-client";
import {
  sendPushToSubscription,
  type PushPayload,
} from "@/lib/push/web-push-client";

export async function sendIncomingCallPush(params: {
  receiverId: string;
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string | null;
  callerClerkId: string;
}): Promise<void> {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: params.receiverId },
      select: { id: true, endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const payload: PushPayload = {
      title: "Incoming call",
      body: `${params.callerName} is calling you`,
      icon: params.callerAvatar ?? "/icons/icon-192x192.png",
      badge: "/icons/badge.png",
      tag: `call:${params.callId}`,
      requireInteraction: true,
      data: {
        type: "INCOMING_CALL",
        callId: params.callId,
        callerId: params.callerId,
        callerName: params.callerName,
        callerAvatar: params.callerAvatar,
        callerClerkId: params.callerClerkId,
        // ✅ CHANGED: Points to /community/active
        url: `/community/active/${params.callId}`,
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
    console.error("[sendIncomingCallPush] Error:", err);
  }
}