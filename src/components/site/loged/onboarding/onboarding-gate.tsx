import { getCurrentUserAction } from "@/app/actions/user/get-current-user";
import type { OnboardingStep } from "./onboarding-modal";
import { OnboardingModal } from "./onboarding-modal";

export async function OnboardingGate() {
  console.log("\n========== [OnboardingGate] START ==========");

  const result = await getCurrentUserAction();

  console.log("[OnboardingGate] result.success:", result.success);
  console.log("[OnboardingGate] full result:", result);

  if (!result.success) {
    console.log("[OnboardingGate] ❌ No user → return null");
    console.log("========== [OnboardingGate] END ==========\n");
    return null;
  }

  const user = result.user;

  console.log("[OnboardingGate] user.id:", user.id);
  console.log(
    "[OnboardingGate] user.onboardingCompletedAt:",
    user.onboardingCompletedAt,
    "| typeof:",
    typeof user.onboardingCompletedAt,
  );

  if (user.onboardingCompletedAt) {
    console.log("[OnboardingGate] ⚠️ Already onboarded → return null");
    console.log("========== [OnboardingGate] END ==========\n");
    return null;
  }

  console.log("[OnboardingGate] ✅ RENDERING MODAL");
  console.log("========== [OnboardingGate] END ==========\n");

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