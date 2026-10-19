// src/lib/cache-key.ts
// ============================================================
// CENTRAL CACHE TAGS — NARRO
// Used with `use cache` + `revalidateTag`
// Every key has a matching revalidate* helper.
// ============================================================

import { revalidatePath, revalidateTag } from "next/cache";

// ============================================================
// TAGS
// ============================================================

export const CACHE_TAGS = {
  // ── Users ──
  users: "users",
  user: (clerkId: string) => `user:${clerkId}`,
  
  // ── Receiver profile (/community/[id]) ──
  receiverUser: (clerkId: string) => `receiver-user:${clerkId}`,

  // ── Onboarding ──
  onboarding: (clerkId: string) => `onboarding:${clerkId}`,

  // ── PUBLIC LANDING PAGE PREVIEWS ──
  homepageCommunity: "homepage-community",
  homepageRooms: "homepage-rooms",

  // ── PUBLIC DIRECTORY PAGES ──
  communityDirectory: "community-directory", 

  // ── ROOMS ──
  rooms: "rooms",
  room: (roomId: string) => `room:${roomId}`,
  
  // ✅ NEW: Speaker Requests Tag
  roomRequests: (roomId: string) => `room-requests:${roomId}`,
} as const;

// ============================================================
// HELPERS
// ============================================================

const NOW = { expire: 0 } as const;

// ─────────────────────────────────────────────
// ROOMS
// ─────────────────────────────────────────────

export function revalidateRooms() {
  revalidateTag(CACHE_TAGS.rooms, NOW);
  revalidateTag(CACHE_TAGS.homepageRooms, NOW);
  revalidatePath("/");
  revalidatePath("/rooms");
}

export function revalidateSingleRoom(roomId: string) {
  revalidateTag(CACHE_TAGS.room(roomId), NOW);
  revalidateTag(CACHE_TAGS.rooms, NOW); 
  // ✅ Also revalidate the requests for this room
  revalidateTag(CACHE_TAGS.roomRequests(roomId), NOW);
  revalidatePath(`/rooms/active/${roomId}`); 
  revalidatePath("/rooms");
}

/**
 * ✅ NEW: Revalidate ONLY the speaker requests for a specific room.
 * Call after: A user raises their hand, cancels, or the host approves/declines.
 */
export function revalidateSpeakerRequests(roomId: string) {
  revalidateTag(CACHE_TAGS.roomRequests(roomId), NOW);
  revalidatePath(`/rooms/active/${roomId}`);
}

// ─────────────────────────────────────────────
// PUBLIC DIRECTORY
// ─────────────────────────────────────────────

export function revalidateCommunityDirectory() {
  revalidateTag(CACHE_TAGS.communityDirectory, NOW);
  revalidatePath("/community");
}

// ─────────────────────────────────────────────
// PUBLIC HOMEPAGE PREVIEWS
// ─────────────────────────────────────────────

export function revalidateHomepagePreviews() {
  revalidateTag(CACHE_TAGS.homepageCommunity, NOW);
  revalidateTag(CACHE_TAGS.homepageRooms, NOW);
  revalidatePath("/");
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export function revalidateUser(clerkId: string) {
  revalidateTag(CACHE_TAGS.user(clerkId), NOW);
  revalidateTag(CACHE_TAGS.receiverUser(clerkId), NOW);
  revalidateTag(CACHE_TAGS.users, NOW);
  
  revalidateHomepagePreviews(); 
  revalidateCommunityDirectory();

  revalidatePath("/app");
  revalidatePath("/");
  revalidatePath("/community");
  revalidatePath("/app", "layout");
}

export function revalidateUsers() {
  revalidateTag(CACHE_TAGS.users, NOW);
  revalidateHomepagePreviews(); 
  revalidateCommunityDirectory();
  revalidatePath("/app");
  revalidatePath("/app", "layout");
}

export function revalidateUserProfile(clerkId: string) {
  revalidateTag(CACHE_TAGS.user(clerkId), NOW);
  revalidateTag(CACHE_TAGS.receiverUser(clerkId), NOW);
  revalidateTag(CACHE_TAGS.users, NOW);
  revalidateHomepagePreviews();
  revalidateCommunityDirectory();
  revalidatePath("/app/calls");
}

// ─────────────────────────────────────────────
// RECEIVER PROFILE
// ─────────────────────────────────────────────

export function revalidateReceiverUser(receiverClerkId: string) {
  revalidateTag(CACHE_TAGS.receiverUser(receiverClerkId), NOW);
  revalidatePath(`/app/calls/${receiverClerkId}`);
}

// ─────────────────────────────────────────────
// CALLS
// ─────────────────────────────────────────────

export function revalidateCallParticipants(
  callerClerkId: string,
  receiverClerkId: string,
) {
  revalidateTag(CACHE_TAGS.receiverUser(callerClerkId), NOW);
  revalidateTag(CACHE_TAGS.receiverUser(receiverClerkId), NOW);
  revalidateTag(CACHE_TAGS.user(callerClerkId), NOW);
  revalidateTag(CACHE_TAGS.user(receiverClerkId), NOW);
  revalidatePath("/app/calls");
  revalidatePath(`/app/calls/${callerClerkId}`);
  revalidatePath(`/app/calls/${receiverClerkId}`);
}

// ─────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────

export function revalidateOnboarding(clerkId: string) {
  revalidateTag(CACHE_TAGS.onboarding(clerkId), NOW);
  revalidateTag(CACHE_TAGS.user(clerkId), NOW);
  revalidateTag(CACHE_TAGS.receiverUser(clerkId), NOW);
  revalidateTag(CACHE_TAGS.users, NOW);
  revalidateHomepagePreviews();
  revalidateCommunityDirectory();
  revalidatePath("/app");
  revalidatePath("/app", "layout");
}