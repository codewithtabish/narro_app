"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import type { OnboardingStep } from "./onboarding-modal";

/* -------------------------------------------------------------------------- */
/*  Step Indicator — animated pill progress                                    */
/* -------------------------------------------------------------------------- */

interface StepIndicatorProps {
  currentStep: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
}

const STEP_LABELS = ["Profile", "Languages", "Level", "Interests"];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function StepIndicator({
  stepIndex,
  totalSteps,
}: StepIndicatorProps) {
  const reduceMotion = useReducedMotion();
  const progress = (stepIndex + 1) / totalSteps;

  return (
    <div className="flex items-center gap-4">
      {/* ─────────── Progress rail + dots ─────────── */}
      <div
        className="relative flex items-center"
        aria-hidden="true"
        style={{ width: `${totalSteps * 22}px` }}
      >
        {/* Track (background rail) */}
        <span
          className={cn(
            "absolute left-[11px] right-[11px] top-1/2 h-px -translate-y-1/2",
            "bg-border/70",
          )}
        />

        {/* Filled progress */}
        <motion.span
          className="absolute left-[11px] top-1/2 h-px -translate-y-1/2 bg-primary"
          initial={false}
          animate={{
            width: reduceMotion
              ? `calc(${progress * 100}% - 22px)`
              : `calc(${progress * 100}% - 22px)`,
          }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          style={{ maxWidth: `calc(100% - 22px)` }}
        />

        {/* Dots */}
        <ol className="relative z-10 flex w-full items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const isComplete = i < stepIndex;
            const isCurrent = i === stepIndex;

            return (
              <li key={i} className="flex items-center justify-center">
                <motion.span
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className={cn(
                    "relative flex h-[22px] w-[22px] items-center justify-center",
                    "rounded-full ring-4",
                    // fill + ring
                    isComplete && "bg-primary ring-primary/10",
                    isCurrent && "bg-primary ring-primary/20",
                    !isComplete && !isCurrent && "bg-card ring-transparent",
                    // border for inactive
                    !isComplete && !isCurrent && "ring-1 ring-border",
                  )}
                >
                  {/* Completed → check */}
                  {isComplete && (
                    <Check
                      className="h-3 w-3 text-primary-foreground"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  )}

                  {/* Current → pulsing dot */}
                  {isCurrent && (
                    <>
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={
                          reduceMotion
                            ? undefined
                            : { scale: [1, 1.6], opacity: [0.5, 0] }
                        }
                        transition={{
                          duration: 1.8,
                          ease: "easeOut",
                          repeat: Infinity,
                        }}
                      />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    </>
                  )}

                  {/* Inactive → small inner dot */}
                  {!isComplete && !isCurrent && (
                    <span className="h-1 w-1 rounded-full bg-border" />
                  )}
                </motion.span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ─────────── Label ─────────── */}
      <div className="flex flex-col">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.18em]",
            "text-primary",
          )}
        >
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          {STEP_LABELS[stepIndex] ?? ""}
        </span>
      </div>
    </div>
  );
}