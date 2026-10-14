"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { getCurrentUserAction } from "@/app/actions/user/get-current-user";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface PlanSnapshot {
  planTier: "FREE" | "PRO";
  freeSecondsRemaining: number;
  freeSecondsGranted: number;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatMinutes(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m <= 0) return "< 1 min";
  if (m === 1) return "1 min";
  return `${m} min`;
}

function getPercentRemaining(remaining: number, granted: number): number {
  if (granted <= 0) return 0;
  return Math.max(0, Math.min(100, (remaining / granted) * 100));
}

/* -------------------------------------------------------------------------- */
/*  UserPlanBadge                                                              */
/* -------------------------------------------------------------------------- */

export function UserPlanBadge() {
  const reduceMotion = useReducedMotion();
  const [snapshot, setSnapshot] = React.useState<PlanSnapshot | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result = await getCurrentUserAction();
      if (cancelled) return;
      if (result.success) {
        setSnapshot({
          planTier: result.user.planTier,
          freeSecondsRemaining: result.user.freeSecondsRemaining,
          freeSecondsGranted: result.user.freeSecondsGranted,
        });
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Loading → subtle skeleton                                          */
  /* ------------------------------------------------------------------ */
  if (!snapshot) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "hidden h-9 items-center gap-2 rounded-full px-3 sm:inline-flex",
          "bg-secondary/60",
        )}
      >
        <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-border" />
        <span className="h-2.5 w-12 animate-pulse rounded bg-border" />
      </div>
    );
  }

  const isPro = snapshot.planTier === "PRO";
  const percent = getPercentRemaining(
    snapshot.freeSecondsRemaining,
    snapshot.freeSecondsGranted,
  );
  const isLow = !isPro && percent <= 20 && snapshot.freeSecondsRemaining > 0;
  const isEmpty = !isPro && snapshot.freeSecondsRemaining <= 0;

  /* ------------------------------------------------------------------ */
  /*  PRO users → premium plan badge                                     */
  /* ------------------------------------------------------------------ */
  if (isPro) {
    return (
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/app/upgrade"
          aria-label="Pro plan — view subscription"
          className={cn(
            "group hidden h-9 items-center gap-1.5 rounded-full px-3 sm:inline-flex",
            "bg-primary text-primary-foreground",
            "shadow-[0_6px_16px_-6px_var(--color-primary)]",
            "transition-all duration-200",
            "hover:bg-primary/90 hover:shadow-[0_8px_22px_-6px_var(--color-primary)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <Zap
            className="h-3.5 w-3.5"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
            Pro
          </span>
          <span className="text-[11px] font-medium opacity-80">
            · Unlimited
          </span>
        </Link>
      </motion.div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  FREE users → minutes remaining pill                                */
  /* ------------------------------------------------------------------ */
  const textColor = isEmpty
    ? "text-destructive"
    : isLow
      ? "text-amber-600 dark:text-amber-500"
      : "text-foreground";

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden sm:block"
    >
      <Link
        href="/app/upgrade"
        aria-label={
          isEmpty
            ? "Free minutes used up — upgrade to Pro"
            : `${formatMinutes(snapshot.freeSecondsRemaining)} of AI time remaining — view plans`
        }
        className={cn(
          "group inline-flex h-9 items-center gap-2 rounded-full pl-2.5 pr-3",
          "bg-secondary/70",
          "transition-all duration-200",
          "hover:bg-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {/* Icon */}
        {isEmpty ? (
          <Sparkles
            className="h-3.5 w-3.5 text-destructive"
            strokeWidth={2.25}
            aria-hidden="true"
          />
        ) : (
          <Clock
            className={cn(
              "h-3.5 w-3.5",
              isLow
                ? "text-amber-600 dark:text-amber-500"
                : "text-primary",
            )}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        )}

        {/* Minutes text */}
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums",
            textColor,
          )}
        >
          {isEmpty
            ? "No minutes left"
            : formatMinutes(snapshot.freeSecondsRemaining)}
        </span>

        {/* Free label */}
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/80">
          Free
        </span>
      </Link>
    </motion.div>
  );
}