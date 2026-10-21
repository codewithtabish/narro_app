// src/components/site/pages/live-stream/gift-modal.tsx
"use client";

import { Coins, Loader2, X } from "lucide-react";
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
  const lock = useRef(false); // blocks double taps before React re-renders

  const selected = GIFTS.find((g) => g.id === selectedId) ?? null;
  const canAfford = selected ? balance >= selected.coinCost : false;

  function close() {
    if (isPending) return; // don't close mid-send
    setError(null);
    onOpenChange(false);
  }

  /* ── Escape to close + lock page scroll while open ── */
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

  // Only renders after a user click (never during hydration), so this guard is safe.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/70 animate-in fade-in duration-200"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-modal-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col gap-4 rounded-t-2xl border border-border bg-card p-5 text-card-foreground shadow-xl animate-in fade-in zoom-in-95 duration-200 sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2
              id="gift-modal-title"
              className="truncate text-lg font-semibold leading-none text-foreground"
            >
              Send a gift to {hostName}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Coins className="size-4 text-primary" aria-hidden="true" />
              <span>
                Your balance:{" "}
                <strong className="text-foreground">{balance.toLocaleString()}</strong> coins
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={isPending}
            aria-label="Close"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Choose a gift"
          className="grid grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4"
        >
          {GIFTS.map((gift) => {
            const active = gift.id === selectedId;
            const affordable = balance >= gift.coinCost;
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
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-accent",
                  !affordable && !active && "opacity-50",
                )}
              >
                <span className="text-3xl leading-none" aria-hidden="true">
                  {gift.emoji}
                </span>
                <span className="text-xs font-medium text-foreground">{gift.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Coins className="size-3" aria-hidden="true" />
                  {gift.coinCost.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={!selected || isPending || !canAfford}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : selected ? (
            `Send ${selected.name} · ${selected.coinCost.toLocaleString()} coins`
          ) : (
            "Select a gift"
          )}
        </button>
      </div>
    </div>,
    document.body,
  );
}