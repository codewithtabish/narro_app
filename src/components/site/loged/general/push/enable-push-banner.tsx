// src/components/site/loged/general/push/enable-push-banner.tsx
"use client";

import { Bell, Loader2, X } from "lucide-react";
import { useState } from "react";

import { usePushSubscription } from "@/hooks/use-push-subscription";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DISMISSED_KEY = "narro:push-banner-dismissed";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function readInitialDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  EnablePushBanner                                                           */
/* -------------------------------------------------------------------------- */
/**
 * Shows a banner asking the user to enable push notifications.
 *
 * Behavior:
 *  - Hidden if user has previously dismissed it (localStorage flag)
 *  - Hidden if the browser doesn't support push at all
 *  - Hidden if permission is explicitly "denied"
 *  - SHOWN if permission is "granted" but no active subscription is
 *    confirmed — this lets the user re-trigger the save if the DB
 *    row is missing.
 *  - SHOWN if permission is "default" (hasn't been asked yet)
 *  - SHOWN if permission is "granted" but isSubscribed is false
 */
export function EnablePushBanner() {
  const { permission, isSubscribed, isWorking, error, enable } =
    usePushSubscription();

  const [hidden, setHidden] = useState<boolean>(readInitialDismissed);

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
    setHidden(true);
  }

  /* ── Visibility rules ─────────────────────────────────── */
  if (hidden) return null;
  if (permission === "unsupported") return null;
  if (permission === "denied") return null;

  // Already granted AND subscribed → no need to show
  if (permission === "granted" && isSubscribed) return null;

  // Everything else → show the banner

  return (
    <div
      role="region"
      aria-label="Enable push notifications"
      className={cn(
        "relative flex items-start gap-3 rounded-2xl",
        "border border-[#805039]/20 bg-[#f5ece1] p-4",
        "dark:border-[#d9a584]/20 dark:bg-[#2a1f16]",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#805039]/15 text-[#805039] dark:text-[#d9a584]">
        <Bell size={18} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">
          Never miss a call
        </p>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {permission === "granted"
            ? "Finish setting up notifications so NARRO can ring you when someone calls."
            : "Turn on notifications so NARRO can ring you when someone calls — even if the site is closed."}
        </p>

        <button
          type="button"
          onClick={enable}
          disabled={isWorking}
          className={cn(
            "mt-2 inline-flex h-9 w-fit items-center justify-center gap-2 rounded-full",
            "bg-[#805039] px-4 text-xs font-semibold text-white",
            "transition-all duration-200",
            "hover:bg-[#6e432f]",
            "active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#805039]/40",
          )}
        >
          {isWorking ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Enabling…
            </>
          ) : (
            <>
              <Bell size={14} />
              {permission === "granted"
                ? "Finish setup"
                : "Enable notifications"}
            </>
          )}
        </button>

        {/* Show any error from the hook */}
        {error && (
          <p className="mt-1 text-[11px] text-red-600">{error}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className={cn(
          "shrink-0 rounded-full p-1.5 text-muted-foreground",
          "transition-colors hover:bg-black/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#805039]/40",
        )}
      >
        <X size={14} />
      </button>
    </div>
  );
}