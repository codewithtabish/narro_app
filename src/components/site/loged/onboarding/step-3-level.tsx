"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import * as React from "react";

import { LANGUAGES } from "@/data/languages";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "./onboarding-modal";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const LEVELS = [
  {
    value: "BEGINNER",
    label: "Beginner",
    hint: "I know a few words",
    short: "A1",
  },
  {
    value: "ELEMENTARY",
    label: "Elementary",
    hint: "I can have simple conversations",
    short: "A2",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    hint: "I can discuss familiar topics",
    short: "B1",
  },
  {
    value: "UPPER_INTERMEDIATE",
    label: "Upper Intermediate",
    hint: "I can handle most conversations",
    short: "B2",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    hint: "I speak fluently with minor errors",
    short: "C1",
  },
  {
    value: "NATIVE",
    label: "Native",
    hint: "It's my first language",
    short: "C2",
  },
] as const;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Step 3 — Proficiency Level                                                 */
/* -------------------------------------------------------------------------- */

interface Step3LevelProps {
  data: OnboardingData;
  updateData: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Level({
  data,
  updateData,
  onNext,
  onBack,
}: Step3LevelProps) {
  const reduceMotion = useReducedMotion();
  const learningLanguages = data.languagesLearning;

  const setLevel = (languageCode: string, level: string) => {
    updateData({
      proficiencyByLanguage: {
        ...data.proficiencyByLanguage,
        [languageCode]: level,
      },
    });
  };

  const canContinue = learningLanguages.every(
    (code) => !!data.proficiencyByLanguage[code],
  );

  const completedCount = learningLanguages.filter(
    (code) => !!data.proficiencyByLanguage[code],
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADING                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.05 }}
        className="text-center"
      >
        <h2
          id="onboarding-modal-title"
          className="font-serif text-[1.6rem] font-normal leading-tight tracking-[-0.02em] text-foreground sm:text-[1.85rem]"
        >
          What&apos;s your level?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          This helps us adapt conversations to your level.
        </p>

        {/* Progress indicator for multi-language users */}
        {learningLanguages.length > 1 && (
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              {completedCount} of {learningLanguages.length} set
            </span>
            <div className="flex items-center gap-1">
              {learningLanguages.map((code) => (
                <span
                  key={code}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                    data.proficiencyByLanguage[code]
                      ? "bg-primary"
                      : "bg-border",
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* LANGUAGE SECTIONS                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="mt-8 space-y-10">
        {learningLanguages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No learning languages selected
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Go back and add at least one language to practice.
            </p>
          </div>
        ) : (
          learningLanguages.map((code, index) => {
            const lang = LANGUAGES.find((l) => l.code === code);
            const selectedLevel = data.proficiencyByLanguage[code];
            const isComplete = !!selectedLevel;

            return (
              <motion.div
                key={code}
                initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: EASE_OUT,
                  delay: 0.15 + index * 0.08,
                }}
              >
                {/* ─── Language header ─── */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-9 w-9 items-center justify-center",
                        "rounded-full bg-secondary text-lg",
                        "ring-1 ring-border",
                      )}
                    >
                      {lang?.flag ?? "🌐"}
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-[15px] font-semibold leading-tight text-foreground">
                        {lang?.name ?? code}
                      </h3>
                      {lang?.nativeName && (
                        <span className="text-[11px] text-muted-foreground">
                          {lang.nativeName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Complete checkmark */}
                  <AnimatePresence>
                    {isComplete && (
                      <motion.span
                        initial={
                          reduceMotion
                            ? undefined
                            : { opacity: 0, scale: 0.6 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full",
                          "bg-primary/10 px-2.5 py-1",
                          "text-[10px] font-bold uppercase tracking-[0.08em] text-primary",
                        )}
                      >
                        <Check
                          className="h-3 w-3"
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                        Set
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* ─── Level options ─── */}
                <div className="space-y-2">
                  {LEVELS.map((level) => {
                    const isSelected = selectedLevel === level.value;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setLevel(code, level.value)}
                        className={cn(
                          "group relative flex w-full items-center gap-3.5",
                          "rounded-2xl border px-4 py-3 text-left",
                          "transition-all duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                          isSelected
                            ? "border-primary bg-primary/6 ring-1 ring-primary/20"
                            : "border-border bg-background hover:border-primary/40 hover:bg-primary/3",
                        )}
                      >
                        {/* Selection indicator */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "relative flex h-5 w-5 shrink-0 items-center justify-center",
                            "rounded-full transition-all duration-200",
                            isSelected
                              ? "bg-primary"
                              : "border-2 border-border bg-transparent group-hover:border-primary/50",
                          )}
                        >
                          {isSelected && (
                            <motion.span
                              initial={
                                reduceMotion
                                  ? undefined
                                  : { scale: 0, opacity: 0 }
                              }
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                duration: 0.2,
                                ease: EASE_OUT,
                              }}
                            >
                              <Check
                                className="h-3 w-3 text-primary-foreground"
                                strokeWidth={3.5}
                                aria-hidden="true"
                              />
                            </motion.span>
                          )}
                        </span>

                        {/* Level text */}
                        <span className="flex flex-1 flex-col">
                          <span
                            className={cn(
                              "text-sm font-semibold leading-tight transition-colors duration-150",
                              isSelected
                                ? "text-primary"
                                : "text-foreground",
                            )}
                          >
                            {level.label}
                          </span>
                          <span className="mt-0.5 text-[11px] text-muted-foreground">
                            {level.hint}
                          </span>
                        </span>

                        {/* CEFR badge */}
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                            "transition-colors duration-200",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {level.short}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ACTIONS                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: EASE_OUT,
          delay: 0.15 + learningLanguages.length * 0.08 + 0.1,
        }}
        className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"
      >
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-full",
            "border border-border bg-transparent px-6",
            "text-sm font-semibold text-foreground",
            "transition-all duration-200",
            "hover:border-primary/40 hover:bg-primary/5",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          )}
        >
          ← Back
        </button>

        <button
          type="submit"
          disabled={!canContinue}
          className={cn(
            "group inline-flex h-11 items-center justify-center gap-2 rounded-full",
            "bg-primary px-8 text-sm font-semibold text-primary-foreground",
            "shadow-[0_8px_20px_-6px_var(--color-primary)]",
            "transition-all duration-200",
            "hover:bg-primary/90 hover:shadow-[0_12px_28px_-8px_var(--color-primary)]",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
          )}
        >
          Continue
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
      </motion.div>
    </form>
  );
}