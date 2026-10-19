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
  rooms: "rooms",                             // Global list of rooms (/rooms)
  room: (roomId: string) => `room:${roomId}`, // A specific room's data (/rooms/[roomId])
} as const;

// ============================================================
// HELPERS
// ============================================================

const NOW = { expire: 0 } as const;

// ─────────────────────────────────────────────
// ROOMS
// ─────────────────────────────────────────────

/**
 * Revalidate the global Rooms lists (Home page + /rooms page).
 * Call after: A room is created, a room is closed, or a room's 
 * details change (e.g., max participants).
 */
export function revalidateRooms() {
  revalidateTag(CACHE_TAGS.rooms, NOW);
  revalidateTag(CACHE_TAGS.homepageRooms, NOW);
  revalidatePath("/");
  revalidatePath("/rooms"); // ✅ Fixed: /rooms instead of /community
}

/**
 * Revalidate a SINGLE room's cached data (used for the room page).
 * Call after: A user joins or leaves the room (to update the participant count).
 */
export function revalidateSingleRoom(roomId: string) {
  revalidateTag(CACHE_TAGS.room(roomId), NOW);
  revalidateTag(CACHE_TAGS.rooms, NOW); 
  revalidatePath(`/rooms/${roomId}`); // ✅ Fixed: /rooms/[roomId]
  revalidatePath("/rooms");           // ✅ Fixed: /rooms
}

// ─────────────────────────────────────────────
// PUBLIC DIRECTORY
// ─────────────────────────────────────────────

/**
 * Revalidate the full public community directory (/community).
 */
export function revalidateCommunityDirectory() {
  revalidateTag(CACHE_TAGS.communityDirectory, NOW);
  revalidatePath("/community");
}

// ─────────────────────────────────────────────
// PUBLIC HOMEPAGE PREVIEWS
// ─────────────────────────────────────────────

/**
 * Revalidate the PUBLIC landing page previews (Users + Rooms).
 */
export function revalidateHomepagePreviews() {
  revalidateTag(CACHE_TAGS.homepageCommunity, NOW);
  revalidateTag(CACHE_TAGS.homepageRooms, NOW);
  revalidatePath("/");
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

/**
 * Revalidate ONE user's cached data.
 */
export function revalidateUser(clerkId: string) {
  revalidateTag(CACHE_TAGS.user(clerkId), NOW);
  revalidateTag(CACHE_TAGS.receiverUser(clerkId), NOW);
  revalidateTag(CACHE_TAGS.users, NOW);
  
  // Update public pages
  revalidateHomepagePreviews(); 
  revalidateCommunityDirectory();

  revalidatePath("/app");
  revalidatePath("/");
  revalidatePath("/community");
  revalidatePath("/app", "layout");
}

/**
 * Revalidate ALL users.
 */
export function revalidateUsers() {
  revalidateTag(CACHE_TAGS.users, NOW);
  
  // Update public pages
  revalidateHomepagePreviews(); 
  revalidateCommunityDirectory();

  revalidatePath("/app");
  revalidatePath("/app", "layout");
}

/**
 * Revalidate ONE user's cached PUBLIC PROFILE only.
 */
export function revalidateUserProfile(clerkId: string) {
  revalidateTag(CACHE_TAGS.user(clerkId), NOW);
  revalidateTag(CACHE_TAGS.receiverUser(clerkId), NOW);
  revalidateTag(CACHE_TAGS.users, NOW);
  
  // Update public pages (e.g. if they go offline)
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

  // CRITICAL: Add them to all public directories immediately
  revalidateHomepagePreviews();
  revalidateCommunityDirectory();

  revalidatePath("/app");
  revalidatePath("/app", "layout");
}