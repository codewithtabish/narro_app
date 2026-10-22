// src/lib/livestream/live-stream-events.ts
// Shared (client + server) types for LiveKit data packets sent by the SERVER.
// Topics: "chat" | "gift" | "reaction"

export const LIVE_TOPICS = {
  chat: "chat",
  gift: "gift",
  reaction: "reaction",
} as const;

export const MAX_CHAT_LENGTH = 200;

export interface ChatEventPayload {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  text: string;
  createdAt: string;
}

export interface GiftEventPayload {
  id: string; // GiftTransaction id
  giftId: string;
  giftName: string;
  emoji: string;
  /**
   * Add this on the server (session.user.id) so the sender's own gift is
   * de-duplicated exactly, and so two different people sending the same gift
   * at the same time are never mixed up. Optional = old servers keep working.
   */
  senderId?: string;
  senderName: string;
  senderImage: string | null;
  createdAt: string;
}

export interface ReactionEventPayload {
  id: string;
  senderId: string;
  count: number;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

export function isChatPayload(v: unknown): v is ChatEventPayload {
  return (
    isObj(v) &&
    typeof v.id === "string" &&
    typeof v.senderId === "string" &&
    typeof v.senderName === "string" &&
    typeof v.text === "string" &&
    typeof v.createdAt === "string"
  );
}

export function isGiftPayload(v: unknown): v is GiftEventPayload {
  return (
    isObj(v) &&
    typeof v.id === "string" &&
    typeof v.giftId === "string" &&
    typeof v.giftName === "string" &&
    typeof v.emoji === "string" &&
    typeof v.senderName === "string" &&
    typeof v.createdAt === "string"
  );
}

export function isReactionPayload(v: unknown): v is ReactionEventPayload {
  return (
    isObj(v) &&
    typeof v.id === "string" &&
    typeof v.senderId === "string" &&
    typeof v.count === "number"
  );
}
