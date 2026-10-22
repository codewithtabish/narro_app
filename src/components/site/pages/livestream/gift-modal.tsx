// src/components/site/pages/livestream/gift-modal.tsx
"use client";

import { Coins, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { sendGift } from "@/app/actions/livestream/send-gift-action";
import { GIFTS, type Gift } from "@/data/gifts";
import { cn } from "@/lib/utils";

interface GiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamId: string;
  hostName: string;
  balance: number;
  onSent: (gift: Gift, newBalance: number) => void;
}

export function GiftModal({
  open,
  onOpenChange,
  streamId,
  hostName,
  balance,
  onSent,
}: GiftModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lock = useRef(false);

  const selected = GIFTS.find((g) => g.id === selectedId) ?? null;
  const canAfford = selected ? balance >= selected.coinCost : false;
  const missing = selected && !canAfford ? selected.coinCost - balance : 0;

  function close() {
    if (isPending) return;
    setError(null);
    onOpenChange(false);
  }

  /* Escape to close + lock page scroll */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        setError(null);
        onOpenChange(false);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, isPending, onOpenChange]);

  function handleSend() {
    if (!selected || lock.current) return;
    if (!canAfford) {
      setError("Not enough coins for this gift.");
      return;
    }

    lock.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const res = await sendGift({ streamId, giftId: selected.id });
        if (res.success) {
          onSent(selected, res.newBalance);
          setSelectedId(null);
          onOpenChange(false);
        } else {
          setError(res.error);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        lock.current = false;
      }
    });
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-modal-title"
        className="relative z-10 flex max-h-[85vh] w-full flex-col gap-3 overflow-hidden rounded-t-3xl border border-white/10 bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-card-foreground shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-8 fade-in duration-250 sm:max-w-sm sm:rounded-3xl sm:pb-4 sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        {/* glow */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 size-40 -translate-x-1/2 rounded-full bg-[#6B4A3A]/40 blur-3xl"
          aria-hidden="true"
        />

        {/* drag handle (mobile) */}
        <div className="mx-auto -mt-1 h-1 w-9 rounded-full bg-muted-foreground/30 sm:hidden" />

        {/* Header */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="gift-modal-title"
              className="flex items-center gap-1.5 truncate text-base font-semibold text-foreground"
            >
              <Sparkles className="size-4 shrink-0 text-amber-400" aria-hidden="true" />
              <span className="truncate">Gift {hostName}</span>
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-500 dark:text-amber-300">
              <Coins className="size-3.5" aria-hidden="true" />
              {balance.toLocaleString()}
            </span>
            <button
              type="button"
              onClick={close}
              disabled={isPending}
              aria-label="Close"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Gift grid */}
        <div
          role="radiogroup"
          aria-label="Choose a gift"
          className="relative grid grid-cols-4 gap-2 overflow-y-auto p-1"
        >
          {GIFTS.map((gift, i) => {
            const active = gift.id === selectedId;
            const affordable = balance >= gift.coinCost;
            const premium = gift.coinCost >= 1000;
            return (
              <button
                key={gift.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={isPending}
                onClick={() => {
                  setSelectedId(gift.id);
                  setError(null);
                }}
                style={{ animationDelay: `${i * 30}ms` }}
                className={cn(
                  "group relative flex flex-col items-center gap-0.5 rounded-2xl border px-1 py-2.5 text-center transition-all duration-200 animate-in fade-in zoom-in-90 fill-mode-both",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  active
                    ? "scale-[1.04] border-[#6B4A3A] bg-[#6B4A3A]/15 shadow-[0_0_0_1px_#6B4A3A,0_6px_20px_-6px_#6B4A3A]"
                    : "border-border bg-background/60 hover:-translate-y-0.5 hover:bg-accent active:scale-95",
                  premium &&
                    !active &&
                    "border-amber-400/40 bg-linear-to-b from-amber-400/10 to-transparent",
                  !affordable && !active && "opacity-45",
                )}
              >
                <span
                  className={cn(
                    "text-3xl leading-none transition-transform duration-200 sm:text-[2rem]",
                    active ? "scale-110" : "group-hover:scale-110",
                  )}
                  aria-hidden="true"
                >
                  {gift.emoji}
                </span>
                <span className="mt-1 text-[11px] font-medium leading-none text-foreground">
                  {gift.name}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] leading-none text-muted-foreground">
                  <Coins className="size-2.5 text-amber-500" aria-hidden="true" />
                  {gift.coinCost.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {(error || missing > 0) && (
          <p role="alert" className="relative text-center text-xs text-destructive">
            {error ?? `You need ${missing.toLocaleString()} more coins for this gift.`}
          </p>
        )}

        {/* Send */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!selected || isPending || !canAfford}
          className="relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-[#6B4A3A] to-[#8a5f4a] px-4 text-sm font-semibold text-white shadow-lg shadow-[#6B4A3A]/30 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4A3A] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : selected ? (
            <>
              <span aria-hidden="true">{selected.emoji}</span>
              Send {selected.name} · {selected.coinCost.toLocaleString()}
            </>
          ) : (
            "Select a gift"
          )}
        </button>
      </div>
    </div>,
    document.body,
  );
}