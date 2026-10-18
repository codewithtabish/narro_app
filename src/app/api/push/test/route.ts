// src/app/api/push/test/route.ts
import { NextResponse } from "next/server";

import prisma from "@/lib/clients/prisma-client";
import { sendPushToSubscription } from "@/lib/push/web-push-client";

export async function GET() {
  try {
    const subs = await prisma.pushSubscription.findMany();

    if (subs.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No subscriptions in DB.",
        count: 0,
      });
    }

    const results = await Promise.all(
      subs.map(async (sub) => {
        const r = await sendPushToSubscription(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          {
            title: "Test push from NARRO",
            body: "If you see this, push works!",
            tag: "narro-test",
            data: { type: "TEST" },
          },
        );

        return {
          userId: sub.userId,
          ok: r.ok,
          gone: r.gone,
          error: r.error,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      count: subs.length,
      results,
    });
  } catch (err) {
    console.error("[api/push/test] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}