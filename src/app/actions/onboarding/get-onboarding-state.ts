"use server";

import prisma from "@/lib/clients/prisma-client";
import { auth } from "@clerk/nextjs/server";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface OnboardingState {
  name: string | null;
  imageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  languagesSpoken: string[];
  languagesLearning: string[];
  proficiencyByLanguage: Record<string, string>;
  interests: string[];
  onboardingCompletedAt: Date | null;
  currentStep: "PROFILE" | "LANGUAGES" | "LEVEL" | "INTERESTS" | "COMPLETED";
}

/* -------------------------------------------------------------------------- */
/*  Get current user's onboarding state                                        */
/* -------------------------------------------------------------------------- */
/**
 * Server Action — fetches the signed-in user's onboarding state.
 *
 * Returns:
 *   - The full state object if the user exists
 *   - `null` if not signed in or user record not found
 *
 * Call from:
 *   - Server Components (directly awaited)
 *   - Client Components (as an async function)
 */
export async function getOnboardingState(): Promise<OnboardingState | null> {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId: clerkId },
    select: {
      name: true,
      imageUrl: true,
      profileImageUrl: true,
      bio: true,
      languagesSpoken: true,
      languagesLearning: true,
      proficiencyByLanguage: true,
      interests: true,
      onboardingCompletedAt: true,
      onboarding: {
        select: {
          currentStep: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    name: user.name,
    imageUrl: user.imageUrl,
    profileImageUrl: user.profileImageUrl,
    bio: user.bio,
    languagesSpoken: user.languagesSpoken,
    languagesLearning: user.languagesLearning,
    proficiencyByLanguage:
      (user.proficiencyByLanguage as Record<string, string>) ?? {},
    interests: user.interests,
    onboardingCompletedAt: user.onboardingCompletedAt,
    currentStep: (user.onboarding?.currentStep ??
      "PROFILE") as OnboardingState["currentStep"],
  };
}