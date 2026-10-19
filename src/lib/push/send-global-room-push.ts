// src/lib/push/send-global-room-push.ts
import "server-only";

import prisma from "@/lib/clients/prisma-client";
import { sendPushToSubscription } from "@/lib/push/web-push-client";

export async function sendGlobalRoomPush(params: {
  roomId: string;
  title: string;
  hostName: string;
  language: string;
}) {
  try {
    const webSubscriptions = await prisma.pushSubscription.findMany({
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (webSubscriptions.length === 0) return;

    const payload = {
      title: "New Speaking Room! 🎙️",
      body: `${params.hostName} just started "${params.title}" in ${params.language}. Join now!`,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge.png",
      tag: `room:${params.roomId}`,
      data: {
        type: "ROOM_INVITE",
        roomId: params.roomId,
        url: `/rooms/${params.roomId}`,
        // ✅ ADDED: The custom sound path
        sound: "/sound/notification.mp3",
      },
    };

    await Promise.all(
      webSubscriptions.map((sub) =>
        sendPushToSubscription(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch(() => {})
      )
    );
  } catch (err) {
    console.error("[sendGlobalRoomPush] Error:", err);
  }
}