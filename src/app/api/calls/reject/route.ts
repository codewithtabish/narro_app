// src/app/api/calls/reject/route.ts
import { NextResponse } from "next/server";

import { rejectCallAction } from "@/app/actions/calls/reject-call-action";

/* -------------------------------------------------------------------------- */
/*  POST — reject a ringing call                                               */
/* -------------------------------------------------------------------------- */
/**
 * Called by the service worker when the user taps "Decline" on an
 * incoming-call push notification.
 *
 * The SW can't call Server Actions directly, so it hits this route.
 * Cookies are sent automatically (same-origin fetch with credentials),
 * so Clerk auth works.
 */
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);

    if (!json || typeof json.callId !== "string") {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 },
      );
    }

    console.log("[api/calls/reject] Rejecting call:", json.callId);

    const result = await rejectCallAction(json.callId);

    if (!result.success) {
      // Map error codes to HTTP statuses
      let status = 400;
      const code = result.error;

      switch (code) {
        case "NOT_AUTHENTICATED":
          status = 401;
          break;
        case "CALL_NOT_FOUND":
        case "USER_NOT_FOUND":
          status = 404;
          break;
        case "FORBIDDEN":
          status = 403;
          break;
        case "CALL_NO_LONGER_AVAILABLE":
          status = 409;
          break;
        case "INVALID_CALL_ID":
          status = 400;
          break;
        case "DATABASE_ERROR":
        default:
          status = 500;
          break;
      }

      console.warn(
        "[api/calls/reject] Failed:",
        code,
        "→",
        status,
      );

      return NextResponse.json(result, { status });
    }

    console.log("[api/calls/reject] Success");
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[api/calls/reject] Error:", err);
    return NextResponse.json(
      { success: false, error: "DATABASE_ERROR" },
      { status: 500 },
    );
  }
}