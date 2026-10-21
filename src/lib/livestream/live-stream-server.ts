// src/lib/live-stream-server.ts
// Server-only helpers for live streams (import from server actions only).

import { DataPacket_Kind, RoomServiceClient } from "livekit-server-sdk";

let cached: RoomServiceClient | null | undefined;

function getRoomService(): RoomServiceClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.LIVEKIT_URL;
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;

  if (!url || !key || !secret) {
    cached = null;
    return cached;
  }

  // RoomServiceClient needs http(s); LIVEKIT_URL is usually ws(s).
  const httpUrl = url.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
  cached = new RoomServiceClient(httpUrl, key, secret);
  return cached;
}

/**
 * Sends a reliable data packet from the SERVER to everyone in the room.
 * Because it has no participant sender, clients can trust it
 * (viewers cannot publish data, so they cannot fake these events).
 */
export async function broadcastToRoom(
  roomName: string,
  topic: string,
  payload: unknown,
): Promise<boolean> {
  const rooms = getRoomService();
  if (!rooms) return false;

  try {
    await rooms.sendData(
      roomName,
      new TextEncoder().encode(JSON.stringify(payload)),
      DataPacket_Kind.RELIABLE,
      { topic },
    );
    return true;
  } catch (err) {
    console.warn(`[broadcastToRoom] "${topic}" failed:`, err);
    return false;
  }
}

/* ── Minimal per-instance rate limiter ──
   Good enough to stop spam from one client. For strict global limits across
   serverless instances, swap this for Upstash/Redis later (same signature). */
const lastHit = new Map<string, number>();

export function allowAction(key: string, minIntervalMs: number): boolean {
  const now = Date.now();
  const last = lastHit.get(key) ?? 0;
  if (now - last < minIntervalMs) return false;

  lastHit.set(key, now);

  if (lastHit.size > 5000) {
    for (const [k, t] of lastHit) {
      if (now - t > 60_000) lastHit.delete(k);
    }
  }
  return true;
}