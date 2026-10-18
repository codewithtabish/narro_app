// src/lib/clients/livekit-client.ts
// ============================================================
// LIVEKIT — Server-side client
// Used by Server Actions + API routes only.
// NEVER import this in a client component.
// ============================================================

import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

/* -------------------------------------------------------------------------- */
/*  Environment                                                                */
/* -------------------------------------------------------------------------- */

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  throw new Error(
    "[livekit-client] Missing LiveKit env vars. Required: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET",
  );
}

/* -------------------------------------------------------------------------- */
/*  Room Service Client                                                        */
/* -------------------------------------------------------------------------- */
/**
 * Manages LiveKit rooms on the server:
 *   - createRoom
 *   - deleteRoom
 *   - listRooms
 *   - listParticipants
 *   - removeParticipant
 *
 * Note: The SDK expects the HTTP(S) URL, not the WebSocket URL.
 *   wss://xxx.livekit.cloud → https://xxx.livekit.cloud
 */
const httpUrl = LIVEKIT_URL.replace(/^wss:/, "https:").replace(/^ws:/, "http:");

export const livekitRoomService = new RoomServiceClient(
  httpUrl,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
);

/* -------------------------------------------------------------------------- */
/*  Token generation                                                           */
/* -------------------------------------------------------------------------- */
/**
 * Creates a short-lived JWT for a participant to join a room.
 *
 * @param options.roomName       LiveKit room identifier
 * @param options.participantId  Unique participant identity (use Prisma user.id)
 * @param options.participantName Display name shown to others
 * @param options.ttl            Token lifetime in seconds (default: 1 hour)
 * @param options.metadata       Optional JSON string (e.g. avatar URL)
 */
export interface CreateTokenOptions {
  roomName: string;
  participantId: string;
  participantName: string;
  ttl?: number;
  metadata?: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
}

export async function createLiveKitToken({
  roomName,
  participantId,
  participantName,
  ttl = 60 * 60, // 1 hour
  metadata,
  canPublish = true,
  canSubscribe = true,
}: CreateTokenOptions): Promise<string> {
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantId,
    name: participantName,
    ttl,
    metadata,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe,
    canPublishData: true,
  });

  return token.toJwt();
}

/* -------------------------------------------------------------------------- */
/*  Room helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Creates a LiveKit room (idempotent — if it exists, LiveKit returns it).
 * Empty rooms auto-close after a few minutes of inactivity.
 */
export async function createLiveKitRoom(options: {
  name: string;
  emptyTimeout?: number; // seconds — default: 5 minutes
  maxParticipants?: number;
}) {
  return livekitRoomService.createRoom({
    name: options.name,
    emptyTimeout: options.emptyTimeout ?? 60 * 5,
    maxParticipants: options.maxParticipants ?? 2,
  });
}

/**
 * Deletes a LiveKit room. Kicks out all participants.
 */
export async function deleteLiveKitRoom(roomName: string) {
  try {
    await livekitRoomService.deleteRoom(roomName);
  } catch (err) {
    // Room might already be gone — that's fine
    console.warn("[livekit] deleteRoom failed (may not exist):", err);
  }
}

/**
 * Lists active participants in a room.
 */
export async function listLiveKitParticipants(roomName: string) {
  return livekitRoomService.listParticipants(roomName);
}

/**
 * Generates a unique room name for a 1-to-1 call.
 * Format: narro-call-{cuid}
 */
export function generateCallRoomName(callId: string): string {
  return `narro-call-${callId}`;
}
