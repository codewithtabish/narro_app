"use client";

import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import * as React from "react";
import { StepIndicator } from "./step-indicator";

import { Step1Profile } from "./step-1-profile";
import { Step2Languages } from "./step-2-languages";
import { Step3Level } from "./step-3-level";
import { Step4Interests } from "./step-4-interests";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type OnboardingStep = "PROFILE" | "LANGUAGES" | "LEVEL" | "INTERESTS";

export interface OnboardingData {
  name: string;
  profileImageUrl: string | null;
  languagesSpoken: string[];
  languagesLearning: string[];
  proficiencyByLanguage: Record<string, string>;
  bio: string;
  interests: string[];
}

interface OnboardingModalProps {
  initialData: Partial<OnboardingData>;
  resumeStep: OnboardingStep;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STEP_ORDER: OnboardingStep[] = [
  "PROFILE",
  "LANGUAGES",
  "LEVEL",
  "INTERESTS",
];

const DEFAULT_DATA: OnboardingData = {
  name: "",
  profileImageUrl: null,
  languagesSpoken: [],
  languagesLearning: [],
  proficiencyByLanguage: {},
  bio: "",
  interests: [],
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  OnboardingModal                                                            */
/* -------------------------------------------------------------------------- */

export function OnboardingModal({
  initialData,
  resumeStep,
}: OnboardingModalProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const reduceMotion = useReducedMotion();

  const [data, setData] = React.useState<OnboardingData>({
    ...DEFAULT_DATA,
    ...initialData,
  });

  const [currentStep, setCurrentStep] = React.useState<OnboardingStep>(
    resumeStep === ("COMPLETED" as OnboardingStep) ? "PROFILE" : resumeStep,
  );

  const [signingOut, setSigningOut] = React.useState(false);

  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length;

  // Lock body scroll while modal is open
  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const updateData = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const goToNextStep = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < totalSteps) {
      setCurrentStep(STEP_ORDER[nextIndex]);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEP_ORDER[prevIndex]);
    }
  };

  const handleComplete = () => {
    router.refresh();
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.error("[onboarding-modal] Sign out failed:", err);
      setSigningOut(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "PROFILE":
        return (
          <Step1Profile
            data={data}
            updateData={updateData}
            onNext={goToNextStep}
          />
        );
      case "LANGUAGES":
        return (
          <Step2Languages
            data={data}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        );
      case "LEVEL":
        return (
          <Step3Level
            data={data}
            updateData={updateData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        );
      case "INTERESTS":
        return (
          <Step4Interests
            data={data}
            updateData={updateData}
            onComplete={handleComplete}
            onBack={goToPrevStep}
          />
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center",
        "bg-[rgba(20,15,12,0.72)] backdrop-blur-md",
        "p-4 sm:p-6",
      )}
    >
      <motion.div
        initial={
          reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.97 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className={cn(
          // Dimensions
          "relative w-full max-w-xl",
          "max-h-[min(85vh,720px)]",
          // Surface — extra rounded, layered shadow
          "overflow-hidden rounded-[28px]",
          "bg-card",
          "shadow-[0_30px_80px_-20px_rgba(20,15,12,0.55),0_8px_24px_-8px_rgba(20,15,12,0.35)]",
          "ring-1 ring-border/70",
          // Layout
          "flex flex-col",
        )}
      >
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HEADER — soft gradient top bar                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          className={cn(
            "relative flex items-center justify-between gap-4",
            "px-6 py-5 sm:px-7",
            "shrink-0",
            "bg-linear-to-b from-primary/4 to-transparent",
          )}
        >
          {/* Bottom border accent */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent"
          />

          <StepIndicator
            currentStep={currentStep}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
          />

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(
              "rounded-full px-3 py-1.5",
              "text-xs font-medium text-muted-foreground",
              "transition-all duration-200",
              "hover:bg-secondary hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* BODY — scrollable step content                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          className={cn(
            "flex-1 overflow-y-auto",
            "px-6 py-7 sm:px-7 sm:py-8",
            // Custom subtle scrollbar
            "scrollbar-thin",
            "[scrollbar-color:var(--color-border)_transparent]",
            "[&::-webkit-scrollbar]:w-2",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-border/60",
            "[&::-webkit-scrollbar-thumb:hover]:bg-border",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={
                reduceMotion
                  ? undefined
                  : { opacity: 0, x: 12 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, x: -12 }
              }
              transition={{ duration: 0.28, ease: EASE_OUT }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}