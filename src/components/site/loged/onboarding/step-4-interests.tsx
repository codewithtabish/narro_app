"use client";

import { completeProfile } from "@/app/actions/onboarding/complete-profile";
import { INTERESTS, MAX_INTERESTS } from "@/data/interests";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { OnboardingData } from "./onboarding-modal";

/* -------------------------------------------------------------------------- */
/*  Step 4 — Bio + Interests                                                   */
/* -------------------------------------------------------------------------- */

interface Step4InterestsProps {
  data: OnboardingData;
  updateData: (patch: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function Step4Interests({
  data,
  updateData,
  onComplete,
  onBack,
}: Step4InterestsProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleInterest = (id: string) => {
    const isSelected = data.interests.includes(id);
    if (isSelected) {
      updateData({ interests: data.interests.filter((i) => i !== id) });
    } else {
      if (data.interests.length >= MAX_INTERESTS) return;
      updateData({ interests: [...data.interests, id] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await completeProfile({
        // Step 1 — Profile
        name: data.name,
        profileImageUrl: data.profileImageUrl,

        // Step 2 — Languages
        languagesSpoken: data.languagesSpoken,
        languagesLearning: data.languagesLearning,

        // Step 3 — Proficiency
        proficiencyByLanguage: data.proficiencyByLanguage,

        // Step 4 — Bio + Interests
        bio: data.bio,
        interests: data.interests,
      });

      if (result.success) {
        // Parent calls router.refresh() → server re-renders → modal unmounts.
        onComplete();
      } else {
        setError(result.error);
        setSubmitting(false);
      }
    } catch (err) {
      console.error("[Step4Interests] submit error:", err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="text-center">
        <h2
          id="onboarding-modal-title"
          className="font-serif text-2xl font-normal tracking-[-0.015em] text-foreground sm:text-3xl"
        >
          Tell us about yourself
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          This helps partners find you. Both fields are optional.
        </p>
      </div>

      <div className="mt-8">
        {/* Bio */}
        <label
          htmlFor="onboarding-bio"
          className="text-sm font-semibold text-foreground"
        >
          Short bio
        </label>
        <textarea
          id="onboarding-bio"
          value={data.bio}
          onChange={(e) => updateData({ bio: e.target.value })}
          placeholder="Tell us a bit about yourself and what you'd like to practice..."
          maxLength={300}
          rows={4}
          disabled={submitting}
          className={cn(
            "mt-2 w-full resize-none rounded-xl border border-border bg-background p-3",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "transition-colors duration-200",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:opacity-60",
          )}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {data.bio.length}/300
        </p>
      </div>

      {/* Interests */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-semibold text-foreground">
            What are you interested in?
          </label>
          <span className="text-xs text-muted-foreground">
            {data.interests.length}/{MAX_INTERESTS} selected
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const isSelected = data.interests.includes(interest.id);
            const isDisabled =
              submitting ||
              (!isSelected && data.interests.length >= MAX_INTERESTS);

            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                disabled={isDisabled}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2",
                  "text-sm font-medium transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground ring-1 ring-border hover:ring-primary/40",
                  isDisabled && "cursor-not-allowed opacity-40",
                )}
              >
                <span aria-hidden="true">{interest.emoji}</span>
                {interest.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-center text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-full",
            "border border-primary/30 bg-transparent px-6",
            "text-sm font-semibold text-primary",
            "transition-colors duration-200 hover:bg-primary/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            "disabled:opacity-50",
          )}
        >
          ← Back
        </button>

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-full",
            "bg-primary px-8 text-sm font-semibold text-primary-foreground",
            "shadow-sm transition-colors duration-200",
            "hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finishing…
            </>
          ) : (
            <>Finish setup ✓</>
          )}
        </button>
      </div>
    </form>
  );
}