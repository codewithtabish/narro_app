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
  
  // ── Receiver profile (/app/calls/[id]) ──
  receiverUser: (clerkId: string) => `receiver-user:${clerkId}`,

  // ── Onboarding ──
  onboarding: (clerkId: string) => `onboarding:${clerkId}`,

  // ── PUBLIC LANDING PAGE PREVIEWS ──
  homepageCommunity: "homepage-community",
  homepageRooms: "homepage-rooms",

  // ── PUBLIC DIRECTORY PAGES ──
  communityDirectory: "community-directory", // NEW: For the /community page
} as const;

// ============================================================
// HELPERS
// ============================================================

const NOW = { expire: 0 } as const;

// ─────────────────────────────────────────────
// PUBLIC DIRECTORY
// ─────────────────────────────────────────────

/**
 * Revalidate the full public community directory (/community).
 * 
 * Call after: A new user completes onboarding, or a user's public 
 * profile data changes (name, bio, languages, availability).
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
  // Revalidate the root landing page path
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