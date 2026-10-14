"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  useCanGoBack — React 19 safe external-store hook                           */
/* -------------------------------------------------------------------------- */
/**
 * Reads whether the user has a same-origin referrer and history to go back
 * to. Uses useSyncExternalStore — the React-recommended pattern for
 * reading from external systems without triggering setState-in-effect
 * warnings.
 *
 * - Server snapshot: false  (no button on the server, no hydration mismatch)
 * - Client snapshot: computed from document.referrer + window.history
 * - subscribe: no-op (this state never changes after page load)
 */
function useCanGoBack(): boolean {
  const subscribe = React.useCallback(() => {
    // No external changes to subscribe to — the value is stable
    // for the lifetime of the page.
    return () => {};
  }, []);

  const getSnapshot = React.useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    const referrer = document.referrer;

    const sameOriginReferrer =
      referrer.length > 0 &&
      (() => {
        try {
          return new URL(referrer).origin === window.location.origin;
        } catch {
          return false;
        }
      })();

    return sameOriginReferrer && window.history.length > 1;
  }, []);

  const getServerSnapshot = React.useCallback((): boolean => false, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* -------------------------------------------------------------------------- */
/*  BackButton                                                                 */
/* -------------------------------------------------------------------------- */

interface BackButtonProps {
  /** Optional label override — defaults to "Back" */
  label?: string;
  /** Optional fallback path if the user has no in-site referrer */
  fallbackHref?: string;
  className?: string;
}

export function BackButton({
  label = "Back",
  fallbackHref = "/",
  className,
}: BackButtonProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  if (!canGoBack) return null;

  const handleClick = () => {
    // If there's in-site history, use router.back()
    // Otherwise, fall back to the provided href.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back to previous page"
      className={cn(
        "group inline-flex items-center gap-2",
        "rounded-full bg-secondary px-4 py-2",
        "text-sm font-medium text-foreground",
        "transition-colors duration-200",
        "hover:bg-secondary/80",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        className,
      )}
    >
      <ArrowLeft
        className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
        strokeWidth={2}
        aria-hidden="true"
      />
      <span>{label}</span>
    </button>
  );
}