
import { connection } from "next/server";

import { getCurrentUserAction } from "@/app/actions/user/get-current-user";

import type { OnboardingStep } from "./onboarding-modal";
import { OnboardingModal } from "./onboarding-modal";

export async function OnboardingGate() {
  // Prevent request-dependent authentication from running during prerendering.
  await connection();

  const result = await getCurrentUserAction();

  // Guests and failed user lookups should not see the onboarding modal.
  if (!result.success) {
    return null;
  }

  const user = result.user;

  // Do not render onboarding for users who have already completed it.
  if (user.onboardingCompletedAt) {
    return null;
  }

  return (
    <OnboardingModal
      initialData={{
        name: user.name ?? "",
        profileImageUrl: user.profileImageUrl ?? null,
        languagesSpoken: user.languagesSpoken ?? [],
        languagesLearning: user.languagesLearning ?? [],
        proficiencyByLanguage: user.proficiencyByLanguage ?? {},
        bio: user.bio ?? "",
        interests: user.interests ?? [],
      }}
      resumeStep={
        (user.onboardingStep as OnboardingStep | null) ?? "PROFILE"
      }
    />
  );
}
