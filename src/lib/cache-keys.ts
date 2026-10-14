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

  // ── Onboarding ──
  onboarding: (clerkId: string) => `onboarding:${clerkId}`,
} as const;

// ============================================================
// HELPERS
// ============================================================

const NOW = { expire: 0 } as const;

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

/**
 * Revalidate ONE user's cached data.
 * Call after: profile update, avatar change, name change.
 */
export function revalidateUser(clerkId: string) {
  revalidateTag(CACHE_TAGS.user(clerkId), NOW);
  revalidateTag(CACHE_TAGS.users, NOW);
  revalidatePath("/app");
  revalidatePath("/app", "layout");
}

/**
 * Revalidate ALL users.
 * Call after: bulk user ops, new user signup, user deletion.
 */
export function revalidateUsers() {
  revalidateTag(CACHE_TAGS.users, NOW);
  revalidatePath("/app");
  revalidatePath("/app", "layout");
}

// ─────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────

/**
 * Revalidate ONE user's onboarding state.
 * Call after every step of the onboarding flow completes:
 *   - Step 1: Profile saved (name + avatar)
 *   - Step 2: Languages saved
 *   - Step 3: Proficiency levels saved
 *   - Step 4: Bio + interests saved → onboarding completed
 *
 * This is the KEY revalidation that closes the onboarding modal —
 * the layout reads `onboardingCompletedAt`, and once that flips
 * from null to a date, the modal stops rendering.
 */
export function revalidateOnboarding(clerkId: string) {
  // Invalidate the onboarding cache for this user
  revalidateTag(CACHE_TAGS.onboarding(clerkId), NOW);

  // Also invalidate the user cache — the user record
  // (name, languages, avatar, etc.) changed too
  revalidateTag(CACHE_TAGS.user(clerkId), NOW);
  revalidateTag(CACHE_TAGS.users, NOW);

  // Refresh the /app path so the layout re-renders without the modal
  revalidatePath("/app");
  revalidatePath("/app", "layout");
}