// src/components/site/pages/community/calling/auto-accept-client.tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { acceptCallAction } from "@/app/actions/calls/accept-call-action";
import { CallRoom } from "./call-room";

/* -------------------------------------------------------------------------- */
/*  AutoAcceptClient                                                           */
/* -------------------------------------------------------------------------- */

export function AutoAcceptClient({ callId }: { callId: string }) {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ready" }
    | { kind: "error"; message: string }
  >({ kind: "loading" });

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;

    (async () => {
      const result = await acceptCallAction(callId);
      if (cancelled) return;

      if (!result.success) {
        setState({
          kind: "error",
          message: result.message || String(result.error),
        });
        return;
      }

      setState({ kind: "ready" });
    })();

    return () => {
      cancelled = true;
    };
  }, [callId]);

  /* ── Loading State ────────────────────────────────────── */
  if (state.kind === "loading") {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
        
        {/* Soft Ambient Background Gradient (Matches CallRoom) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, var(--primary) 0%, transparent 60%)",
            opacity: 0.15,
          }}
        />

        {/* Beautiful Pulsing Loader */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative flex h-32 w-32 items-center justify-center">
            {/* Animated Rings */}
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <span className="absolute inset-4 animate-pulse rounded-full bg-primary/30" />
            
            {/* Center Icon */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
          </div>
          
          <p className="font-serif text-xl text-foreground animate-pulse">
            Connecting…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error State ──────────────────────────────────────── */
  if (state.kind === "error") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
        <div className="max-w-md text-center text-foreground">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20 text-destructive">
            <span className="text-2xl">×</span>
          </div>
          <h1 className="mt-5 font-serif text-2xl">Call unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">{state.message}</p>
          <a
            href="/community"
            className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Back to community
          </a>
        </div>
      </div>
    );
  }

  /* ── Ready State ──────────────────────────────────────── */
  return <CallRoom callId={callId} />;
}