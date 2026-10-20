// src/lib/rooms/room-signals.server.ts
import "server-only";

import {
    DataPacket_Kind,
    ParticipantPermission,
    TrackSource,
} from "livekit-server-sdk";

import { livekitRoomService } from "@/lib/clients/livekit-client";
import { ROOM_SIGNAL_TOPIC, type RoomSignal } from "./room-events";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Retry a flaky call (LiveKit can briefly lag behind a fresh join). */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 400,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await sleep(delayMs);
    }
  }
  throw lastErr;
}

/** Best-effort real-time nudge to specific participants. Never throws. */
export async function sendRoomSignal(
  roomName: string,
  signal: RoomSignal,
  destinationIdentities: string[],
) {
  try {
    const data = new TextEncoder().encode(JSON.stringify(signal));
    await livekitRoomService.sendData(roomName, data, DataPacket_Kind.RELIABLE, {
      topic: ROOM_SIGNAL_TOPIC,
      destinationIdentities,
    });
  } catch (err) {
    console.warn("[sendRoomSignal] failed:", err);
  }
}

/** Changes role in metadata AND publish permission (real enforcement). */
export async function setParticipantRole(
  roomName: string,
  identity: string,
  role: "speaker" | "listener",
) {
  const info = await livekitRoomService.getParticipant(roomName, identity);

  let meta: Record<string, unknown> = {};
  try {
    if (info.metadata) meta = JSON.parse(info.metadata);
  } catch {}

  await livekitRoomService.updateParticipant(
    roomName,
    identity,
    JSON.stringify({ ...meta, role }),
    new ParticipantPermission({
      canSubscribe: true,
      canPublish: role !== "listener",
      canPublishData: role !== "listener",
    }),
  );
}

/** Force-mutes a mic. LiveKit needs the track SID, not the string "microphone". */
export async function muteMicrophone(roomName: string, identity: string) {
  const info = await livekitRoomService.getParticipant(roomName, identity);
  const mic = info.tracks.find((t) => t.source === TrackSource.MICROPHONE);
  if (!mic) return; // not publishing, nothing to mute
  await livekitRoomService.mutePublishedTrack(roomName, identity, mic.sid, true);
}