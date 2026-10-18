// src/lib/actions/onboarding/complete-profile.ts
"use server";

import { auth } from "@clerk/nextjs/server";

import { INTERESTS, MAX_INTERESTS } from "@/data/interests";
import { LANGUAGES } from "@/data/languages";
import { revalidateOnboarding, revalidateUser } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { getCurrentUserAction } from "../user/get-current-user";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CompleteProfileResult =
  | { success: true }
  | { success: false; error: string };

export interface CompleteProfileInput {
  // Step 1 — Profile
  name: string;
  profileImageUrl: string | null;

  // Step 2 — Languages
  languagesSpoken: string[];
  languagesLearning: string[];

  // Step 3 — Proficiency
  proficiencyByLanguage: Record<string, string>;

  // Step 4 — Bio + Interests
  bio: string;
  interests: string[];
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const VALID_LANGUAGE_CODES = new Set(LANGUAGES.map((l) => l.code));
const VALID_INTEREST_IDS = new Set(INTERESTS.map((i) => i.id));

const VALID_LEVELS = new Set([
  "BEGINNER",
  "ELEMENTARY",
  "INTERMEDIATE",
  "UPPER_INTERMEDIATE",
  "ADVANCED",
  "NATIVE",
]);

/* -------------------------------------------------------------------------- */
/*  Complete Onboarding — single action, all steps                             */
/* -------------------------------------------------------------------------- */

export async function completeProfile(
  input: CompleteProfileInput,
): Promise<CompleteProfileResult> {
  try {
    /* ── 1. Authenticate ───────────────────────────────────── */
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { success: false, error: "Not authenticated." };
    }

    /* ── 2. Validate — Step 1 (Profile) ────────────────────── */
    const trimmedName = input.name.trim();

    if (trimmedName.length < 2) {
      return { success: false, error: "Name must be at least 2 characters." };
    }

    if (trimmedName.length > 50) {
      return { success: false, error: "Name must be 50 characters or less." };
    }

    /* ── 3. Validate — Step 2 (Languages) ──────────────────── */
    const spoken = Array.from(new Set(input.languagesSpoken)).filter((c) =>
      VALID_LANGUAGE_CODES.has(c),
    );
    const learning = Array.from(new Set(input.languagesLearning)).filter((c) =>
      VALID_LANGUAGE_CODES.has(c),
    );

    if (spoken.length === 0) {
      return {
        success: false,
        error: "Select at least one language you speak.",
      };
    }

    if (learning.length === 0) {
      return {
        success: false,
        error: "Select at least one language you're learning.",
      };
    }

    /* ── 4. Validate — Step 3 (Proficiency) ────────────────── */
    const proficiency: Record<string, string> = {};

    for (const [code, level] of Object.entries(input.proficiencyByLanguage)) {
      if (!VALID_LANGUAGE_CODES.has(code)) continue;
      if (!VALID_LEVELS.has(level)) continue;
      proficiency[code] = level;
    }

    // Every learning language must have a level
    const missingLevels = learning.filter((code) => !proficiency[code]);
    if (missingLevels.length > 0) {
      return {
        success: false,
        error: `Missing level for: ${missingLevels.join(", ")}.`,
      };
    }

    /* ── 5. Validate — Step 4 (Bio + Interests) ────────────── */
    const trimmedBio = input.bio.trim().slice(0, 300);

    const cleanInterests = Array.from(new Set(input.interests)).filter((id) =>
      VALID_INTEREST_IDS.has(id),
    );

    if (cleanInterests.length > MAX_INTERESTS) {
      return {
        success: false,
        error: `You can select up to ${MAX_INTERESTS} interests.`,
      };
    }

    /* ── 6. Find user ──────────────────────────────────────── */
    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    /* ── 7. Save everything + mark onboarding complete ─────── */
    const now = new Date();

    await prisma.$transaction([
      // User record — all profile data + onboarding flag
      prisma.user.update({
        where: { id: user.id },
        data: {
          // Step 1
          name: trimmedName,
          profileImageUrl: input.profileImageUrl ?? undefined,

          // Step 2
          languagesSpoken: spoken,
          languagesLearning: learning,

          // Step 3
          proficiencyByLanguage: proficiency,

          // Step 4
          bio: trimmedBio || null,
          interests: cleanInterests,

          // Finalize
          onboardingCompletedAt: now,
        },
      }),

      // Onboarding journey — mark all steps complete
      prisma.onboarding.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          currentStep: "COMPLETED",
          completedSteps: ["PROFILE", "LANGUAGES", "LEVEL", "INTERESTS"],
          profileCompletedAt: now,
          languagesCompletedAt: now,
          levelCompletedAt: now,
          interestsCompletedAt: now,
          completedAt: now,
        },
        update: {
          currentStep: "COMPLETED",
          completedSteps: ["PROFILE", "LANGUAGES", "LEVEL", "INTERESTS"],
          profileCompletedAt: now,
          languagesCompletedAt: now,
          levelCompletedAt: now,
          interestsCompletedAt: now,
          completedAt: now,
        },
      }),
    ]);

    /* ── 8. Revalidate caches ──────────────────────────────── */
    revalidateUser(clerkId);
    revalidateOnboarding(clerkId);

    /* ── 9. Warm the current user cache with fresh data ────── */
    // Fire-and-forget — the modal's `router.refresh()` will then
    // read from a warm cache instead of hitting the DB cold.
    await getCurrentUserAction();

    return { success: true };
  } catch (err) {
    console.error("[completeProfile] Error:", err);
    return { success: false, error: "Failed to save your profile." };
  }
}