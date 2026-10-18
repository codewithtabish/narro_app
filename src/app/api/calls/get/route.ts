// src/app/api/calls/get/route.ts
import { getCall } from "@/app/actions/calls/get-call-action";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const callId = url.searchParams.get("callId");

    if (!callId) {
      return NextResponse.json(
        { success: false, error: "Missing callId." },
        { status: 400 },
      );
    }

    const result = await getCall({ callId });

    if (!result.success) {
      let status = 400;
      if (result.error === "Not authenticated.") status = 401;
      else if (result.error.includes("not found")) status = 404;
      else if (result.error.includes("not a participant")) status = 403;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[api/calls/get] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}