// src/app/api/livekit/token/route.ts
// ============================================================
// POST /api/livekit/token
// Thin HTTP wrapper around getCallToken Server Action.
//
// - WEB:   calls getCallToken directly (Server Action)
// - MOBILE: calls this endpoint with Clerk Bearer token
// ============================================================

import { getCallToken } from "@/app/actions/calls/get-call-token";
import { NextResponse } from "next/server";


/* -------------------------------------------------------------------------- */
/*  POST handler                                                               */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    /* ── 1. Parse JSON body ───────────────────────────────── */
    const json = await req.json().catch(() => null);

    if (!json || typeof json.callId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    /* ── 2. Call the Server Action ───────────────────────── */
    const result = await getCallToken({ callId: json.callId });

    /* ── 3. Map result → HTTP response ───────────────────── */
    if (!result.success) {
      // Choose a status code based on the error
      let status = 400;

      if (result.error === "Not authenticated.") status = 401;
      else if (result.error === "Call not found.") status = 404;
      else if (result.error === "User not found.") status = 404;
      else if (result.error.includes("not a participant")) status = 403;
      else if (result.error.includes("cannot be joined")) status = 400;

      return NextResponse.json(
        { success: false, error: result.error },
        { status },
      );
    }

    /* ── 4. Success ───────────────────────────────────────── */
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[api/livekit/token] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}