// src/lib/rooms/room-events.ts
export const ROOM_SIGNAL_TOPIC = "room-signals";

export type RoomSignal =
  | { type: "REQUESTS_CHANGED" } // → host: refetch the list
  | { type: "REQUEST_APPROVED" } // → guest
  | { type: "REQUEST_DECLINED" } // → guest
  | { type: "MOVED_TO_AUDIENCE" }; // → guest

export type ActionResult = { success: boolean; error?: string };

export interface SpeakerRequestItem {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export function decodeRoomSignal(payload: Uint8Array): RoomSignal | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(payload));
    return parsed && typeof parsed.type === "string" ? (parsed as RoomSignal) : null;
  } catch {
    return null;
  }
}