"use client";

import { Loader2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  OnboardingGateFallback                                                     */
/* -------------------------------------------------------------------------- */
/**
 * Shown while <OnboardingGate /> resolves.
 *
 * Renders a small, non-blocking loading pill at the bottom of the screen.
 * The pill is pointer-events-none, so it never intercepts taps — the user
 * can still interact with the app shell while the gate is checking.
 */
export function OnboardingGateFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center"
    >
      <div
        className={[
          "flex items-center gap-2 rounded-full",
          "bg-card/90 px-4 py-2 shadow-lg ring-1 ring-border/60 backdrop-blur",
          "animate-in fade-in duration-200",
        ].join(" ")}
      >
        <Loader2
          className="h-3.5 w-3.5 animate-spin text-primary"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <span className="text-xs font-medium text-muted-foreground">
          Loading…
        </span>
      </div>
    </div>
  );
}