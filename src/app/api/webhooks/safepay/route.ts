import { NextResponse } from "next/server";

import { fulfillCoinPurchase } from "@/lib/coins/fulfill";
import { getSafepay } from "@/lib/safepay/safepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reads a nested value, e.g. pick(event, ["data", "notification", "tracker"]). */
function pick(source: unknown, path: string[]): unknown {
  let current: unknown = source;
  for (const key of path) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function firstString(source: unknown, paths: string[][]): string | undefined {
  for (const path of paths) {
    const value = pick(source, path);
    if (typeof value === "string" && value) return value;
  }
  return undefined;
}

export async function POST(req: Request) {
  const raw = await req.text();

  let event: unknown;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const debug = process.env.SAFEPAY_ENV !== "production";
  if (debug) {
    console.info("[safepay-webhook] received", raw.slice(0, 2000));
  }

  // 1) Prove the request really came from Safepay.
  const signature = req.headers.get("x-sfpy-signature") ?? "";
  let valid = false;
  try {
    valid = await getSafepay().verify.webhook({
      headers: { "x-sfpy-signature": signature },
      body: event,
    } as never);
  } catch (error) {
    console.error("[safepay-webhook] signature check threw", error);
  }

  if (!valid) {
    console.warn("[safepay-webhook] rejected: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2) Pull out which payment this is and whether it was paid.
  const tracker = firstString(event, [
    ["data", "notification", "tracker"],
    ["data", "tracker"],
    ["notification", "tracker"],
    ["tracker"],
  ]);
  const state = firstString(event, [
    ["data", "notification", "state"],
    ["data", "state"],
    ["notification", "state"],
    ["state"],
  ]);

  if (!tracker) {
    console.warn("[safepay-webhook] no tracker found in payload");
    return NextResponse.json({ ok: true, ignored: "no tracker" });
  }

  if (state?.toUpperCase() !== "PAID") {
    if (debug) console.info("[safepay-webhook] ignored state:", state);
    return NextResponse.json({ ok: true, ignored: state ?? "no state" });
  }

  // 3) Credit the coins, exactly once. A 500 here makes Safepay retry later.
  try {
    const result = await fulfillCoinPurchase(tracker);
    if (!result.found) console.warn("[safepay-webhook] unknown tracker", tracker);
    return NextResponse.json({ ok: true, credited: result.credited });
  } catch (error) {
    console.error("[safepay-webhook] fulfil failed", error);
    return NextResponse.json({ error: "Could not process payment" }, { status: 500 });
  }
}