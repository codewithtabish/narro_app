// src/hooks/use-auto-missed.ts
"use client";

import { missedCall } from "@/app/actions/calls/missed-call-action";
import { useEffect, useRef } from "react";


/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * How long a call can ring before it's considered MISSED.
 * Must match the timeout used in:
 *   • ringing-call-action.ts (Layer 2 cleanup)
 *   • cleanup-stale-calls route (Layer 3 cron)
 *   • missed-call-action.ts (server-side guard)
 */
const RINGING_TIMEOUT_MS = 40_000;

/* -------------------------------------------------------------------------- */
/*  useAutoMissed                                                              */
/* -------------------------------------------------------------------------- */
/**
 * Client-side safety net (Layer 1).
 *
 * Starts a 40-second timer when `enabled` is true. When the timer fires,
 * it calls the `missedCall` server action to mark the call as MISSED.
 *
 * The timer is cancelled when:
 *   • `enabled` becomes false (call no longer RINGING — accepted/rejected/ended)
 *   • The component unmounts (user navigated away)
 *   • The `callId` changes
 *
 * If the tab is closed before 40s, Layer 2 (`ringing-call-action` cleanup)
 * or Layer 3 (cron) handles it.
 *
 * @param callId   The call to auto-miss
 * @param enabled  Only runs while the call is RINGING
 *
 * @example
 * ```tsx
 * function RingingView({ callId, status }) {
 *   useAutoMissed(callId, status === "RINGING");
 *   return <div>Calling…</div>;
 * }
 * ```
 */
export function useAutoMissed(callId: string, enabled: boolean): void {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Reset the "fired" flag whenever the call ID changes
    firedRef.current = false;

    const timer = setTimeout(async () => {
      // Guard against double-fires (e.g. StrictMode double mount in dev)
      if (firedRef.current) return;
      firedRef.current = true;

      try {
        const result = await missedCall({ callId });

        if (!result.success) {
          console.warn(
            "[useAutoMissed] missedCall failed:",
            result.error,
          );
        }
      } catch (err) {
        // Network errors are fine — Layer 2/3 will handle cleanup later
        console.error("[useAutoMissed] Error:", err);
      }
    }, RINGING_TIMEOUT_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [callId, enabled]);
}