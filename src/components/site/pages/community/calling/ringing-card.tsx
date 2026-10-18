// src/components/site/loged/single-call/ringing-card.tsx
"use client";

import { Loader2, PhoneOff } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RingingCardProps {
  /** Receiver's display name — used for the "Calling AMIR…" text */
  receiverName: string;
  /** Receiver's avatar URL — falls back to initials */
  receiverAvatar?: string | null;
  /** True while the cancel action is running */
  isEnding?: boolean;
  /** Called when the user clicks Cancel */
  onCancel: () => void;
  /** Optional extra classes */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  RingingCard — presentational only                                          */
/* -------------------------------------------------------------------------- */
/**
 * Purely presentational ringing card. Shown while a call is RINGING.
 *
 * The PARENT component (call-button.tsx) owns:
 *   • the ringingCall server action
 *   • cancelCall on cancel
 *   • useAutoMissed (40s auto-miss timer)
 *   • polling for status change (accept/reject/missed)
 *
 * This component just draws the UI and calls `onCancel` when the user
 * clicks the Cancel button.
 *
 * ── Visual layers ────────────────────────────────────────
 *   • Two concentric pulse rings around the avatar (ping + pulse)
 *   • Receiver's avatar (or initials fallback) inside a rounded circle
 *   • "Calling AMIR…" label
 *   • Three animated dots
 *   • Cancel button (red outline, phone-off icon)
 */
export function RingingCard({
  receiverName,
  receiverAvatar,
  isEnding = false,
  onCancel,
  className,
}: RingingCardProps) {
  const firstName = receiverName.split(" ")[0];
  const initial = receiverName?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-3 rounded-2xl",
        "border border-border bg-card p-4",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={
        isEnding ? "Ending call" : `Calling ${receiverName}`
      }
    >
      {/* ── Avatar with pulse rings ─────────────────────────── */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        {!isEnding && (
          <>
            {/* Outer ping ring */}
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-[#805039]/30"
            />
            {/* Inner pulse ring */}
            <span
              aria-hidden="true"
              className="absolute inset-[-6px] animate-pulse rounded-full bg-[#805039]/15"
            />
          </>
        )}

        {/* Avatar circle */}
        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-background shadow-sm">
          {receiverAvatar ? (
            <Image
              src={receiverAvatar}
              alt={receiverName}
              fill
              sizes="64px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#e9d9c9] font-serif text-xl text-[#805039]">
              {initial}
            </span>
          )}
        </div>
      </div>

      {/* ── Status text ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold text-foreground">
          {isEnding ? "Ending call…" : `Calling ${firstName}…`}
        </p>

        {!isEnding && (
          <span aria-hidden="true" className="flex gap-1">
            <span className="h-1 w-1 animate-bounce rounded-full bg-[#805039] [animation-delay:-0.3s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-[#805039] [animation-delay:-0.15s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-[#805039]" />
          </span>
        )}
      </div>

      {/* ── Cancel button ───────────────────────────────────── */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isEnding}
        aria-label={`Cancel call to ${receiverName}`}
        className={cn(
          "mt-1 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full",
          "border border-red-200 bg-red-50 text-red-700",
          "text-xs font-semibold",
          "transition-all duration-200",
          "hover:bg-red-100",
          "active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
        )}
      >
        {isEnding ? (
          <>
            <Loader2
              className="h-3.5 w-3.5 animate-spin"
              strokeWidth={2.25}
            />
            Ending…
          </>
        ) : (
          <>
            <PhoneOff className="h-3.5 w-3.5" strokeWidth={2.25} />
            Cancel
          </>
        )}
      </button>
    </div>
  );
}