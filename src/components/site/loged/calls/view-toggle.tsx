"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ViewMode = "list" | "grid";

/** What the URL says. "auto" = no explicit choice → screen size decides. */
export type ViewParam = ViewMode | "auto";

/* -------------------------------------------------------------------------- */
/*  Responsive default                                                         */
/*  lg+ (>= 1024px) → grid, everything smaller → list                          */
/* -------------------------------------------------------------------------- */

const LARGE_SCREEN_QUERY = "(min-width: 1024px)";

function subscribeToScreenSize(onChange: () => void) {
  const mql = window.matchMedia(LARGE_SCREEN_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const getIsLargeScreen = () => window.matchMedia(LARGE_SCREEN_QUERY).matches;
const getIsLargeScreenOnServer = () => false;

function useIsLargeScreen() {
  return React.useSyncExternalStore(
    subscribeToScreenSize,
    getIsLargeScreen,
    getIsLargeScreenOnServer,
  );
}

/* -------------------------------------------------------------------------- */
/*  ViewToggle                                                                 */
/* -------------------------------------------------------------------------- */

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const isLargeScreen = useIsLargeScreen();
  const [isPending, startTransition] = React.useTransition();

  const param = searchParams.get("view");
  const explicit: ViewMode | null =
    param === "grid" ? "grid" : param === "list" ? "list" : null;

  // Explicit choice wins. Otherwise: grid on large screens, list on small.
  const current: ViewMode = explicit ?? (isLargeScreen ? "grid" : "list");

  const setView = (view: ViewMode) => {
    // Already pinned to this view in the URL → nothing to do.
    if (view === explicit) return;

    const params = new URLSearchParams(searchParams.toString());
    // Always store the choice, even "list", because list is no longer
    // the default on large screens.
    params.set("view", view);

    const href = `${pathname}?${params.toString()}`;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  };

  return (
    <div
      role="group"
      aria-label="View mode"
      aria-busy={isPending}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-card p-0.5",
        "transition-opacity duration-200",
        isPending && "opacity-60",
      )}
    >
      <ToggleButton
        active={current === "list"}
        onClick={() => setView("list")}
        label="List view"
        icon={<List className="h-4 w-4" strokeWidth={2.25} />}
        reduceMotion={reduceMotion}
      />
      <ToggleButton
        active={current === "grid"}
        onClick={() => setView("grid")}
        label="Grid view"
        icon={<LayoutGrid className="h-4 w-4" strokeWidth={2.25} />}
        reduceMotion={reduceMotion}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fallback — use as the <Suspense> fallback around <ViewToggle />            */
/*  (useSearchParams / usePathname must live inside a Suspense boundary.)      */
/* -------------------------------------------------------------------------- */

export function ViewToggleFallback() {
  return (
    <div
      aria-hidden="true"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border p-0.5"
    >
      <span className="h-10 w-10 animate-pulse rounded-full bg-muted sm:h-8 sm:w-8" />
      <span className="h-10 w-10 animate-pulse rounded-full bg-muted sm:h-8 sm:w-8" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ToggleButton                                                               */
/* -------------------------------------------------------------------------- */

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  reduceMotion: boolean | null;
  label: string;
}

function ToggleButton({
  active,
  onClick,
  icon,
  reduceMotion,
  label,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "relative z-10 inline-flex items-center justify-center rounded-full",
        // 40px touch target on phones, compact 32px on larger screens
        "h-10 w-10 sm:h-8 sm:w-8",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-card",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="view-toggle-indicator"
          transition={{
            duration: reduceMotion ? 0 : 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 -z-10 rounded-full bg-primary"
        />
      )}
      {icon}
    </button>
  );
}