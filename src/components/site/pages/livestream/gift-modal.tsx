// src/components/site/pages/livestream/gift-modal.tsx
"use client";

import { Check, Coins, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { sendGift } from "@/app/actions/livestream/send-gift-action";
import { GIFTS, type Gift } from "@/data/gifts";
import { cn } from "@/lib/utils";

import { BuyCoinsModal } from "./buy-coins-modal";

interface GiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamId: string;
  hostName: string;
  balance: number;
  onSent: (gift: Gift, newBalance: number) => void;
  /** Fired when the payment tab opens, so the parent can start watching the balance. */
  onPaymentStarted?: () => void;
  /** True while the parent is waiting for a payment to be confirmed. */
  awaitingPayment?: boolean;
}

const MIN_GIFT_COST = GIFTS.length ? Math.min(...GIFTS.map((g) => g.coinCost)) : 0;

export function GiftModal({
  open,
  onOpenChange,
  streamId,
  hostName,
  balance,
  onSent,
  onPaymentStarted,
  awaitingPayment = false,
}: GiftModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lock = useRef(false);

  /* The balance only ever goes up from a purchase (sending a gift lowers it),
     so a rise means coins just arrived. Adjusted during render, no effect needed. */
  const [prevBalance, setPrevBalance] = useState(balance);
  const [added, setAdded] = useState(0);
  if (balance !== prevBalance) {
    setPrevBalance(balance);
    if (balance > prevBalance) setAdded(balance - prevBalance);
  }

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(0), 5000);
    return () => clearTimeout(t);
  }, [added]);

  const selected = GIFTS.find((g) => g.id === selectedId) ?? null;
  const canAfford = selected ? balance >= selected.coinCost : false;
  const missing = selected && !canAfford ? selected.coinCost - balance : 0;
  const outOfCoins = balance < MIN_GIFT_COST;
  const coinsNeeded = missing > 0 ? missing : Math.max(0, MIN_GIFT_COST - balance);

  function close() {
    if (isPending) return;
    setError(null);
    onOpenChange(false);
  }

  /* Escape to close + lock page scroll. While the buy dialog is open it owns Escape. */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending && !buyOpen) {
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
  }, [open, isPending, buyOpen, onOpenChange]);

  function handleSend() {
    if (!selected || lock.current) return;

    // Can't afford it: take them straight to buying instead of showing a dead end.
    if (!canAfford) {
      setBuyOpen(true);
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

  return (
    <>
      {createPortal(
        <div
          inert={buyOpen}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gift-modal-title"
            className="relative z-10 flex max-h-[88dvh] w-full flex-col gap-4 overflow-hidden rounded-t-[28px] border border-white/10 bg-card/95 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-card-foreground shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-8 fade-in duration-250 sm:max-w-md sm:rounded-[28px] sm:zoom-in-95 sm:slide-in-from-bottom-0"
          >
            {/* glow */}
            <div
              className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[#6B4A3A]/40 blur-3xl"
              aria-hidden="true"
            />

            {/* drag handle (mobile) */}
            <div className="mx-auto -mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30 sm:hidden" />

            {/* Header */}
            <div className="relative flex shrink-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-300/25 to-amber-500/10 ring-1 ring-amber-400/30">
                  <Sparkles className="size-5 text-amber-400" aria-hidden="true" />
                </span>
                <h2
                  id="gift-modal-title"
                  className="truncate text-lg font-semibold tracking-tight text-foreground"
                >
                  Gift {hostName}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* Balance doubles as a "buy more" button, always one tap away */}
                <button
                  type="button"
                  onClick={() => setBuyOpen(true)}
                  disabled={isPending}
                  aria-label={`You have ${balance.toLocaleString()} coins. Buy more coins`}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 text-xs font-bold tabular-nums text-amber-500 transition-all hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 dark:text-amber-300",
                    added > 0 && "border-emerald-400/60 ring-2 ring-emerald-400/40",
                  )}
                >
                  <Coins className="size-3.5" aria-hidden="true" />
                  {balance.toLocaleString()}
                  <span
                    aria-hidden="true"
                    className="flex size-4 items-center justify-center rounded-full bg-amber-400 text-[12px] font-bold leading-none text-black"
                  >
                    +
                  </span>
                </button>
                <button
                  type="button"
                  onClick={close}
                  disabled={isPending}
                  aria-label="Close"
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Status banner: one at a time, most urgent first */}
            {awaitingPayment ? (
              <div
                role="status"
                className="relative flex shrink-0 items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs font-medium text-amber-600 dark:text-amber-300"
              >
                <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
                Confirming your payment. Your coins appear here automatically.
              </div>
            ) : added > 0 ? (
              <div
                role="status"
                className="relative flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-300"
              >
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
                {added.toLocaleString()} coins added. Pick a gift to send.
              </div>
            ) : outOfCoins ? (
              <div className="relative flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-300">
                  You&apos;re out of coins
                </p>
                <button
                  type="button"
                  onClick={() => setBuyOpen(true)}
                  className="shrink-0 rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-black transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 active:scale-95"
                >
                  Buy coins
                </button>
              </div>
            ) : null}

            {/* Gift grid (the only part that scrolls) */}
            <div
              role="radiogroup"
              aria-label="Choose a gift"
              className="relative grid min-h-0 flex-1 grid-cols-4 content-start gap-2.5 overflow-y-auto p-1"
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
                      "group relative flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-1 py-3 text-center transition-all duration-200 animate-in fade-in zoom-in-90 fill-mode-both",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      active
                        ? "scale-[1.04] border-[#a8745a] bg-linear-to-b from-[#6B4A3A]/30 to-[#6B4A3A]/10 shadow-[0_8px_30px_-10px_#6B4A3A]"
                        : "border-border bg-background/50 hover:-translate-y-0.5 hover:border-white/20 hover:bg-accent active:scale-95",
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
                    <span className="mt-1.5 text-[11px] font-medium leading-none text-foreground">
                      {gift.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold leading-none tabular-nums text-muted-foreground">
                      <Coins className="size-2.5 text-amber-500" aria-hidden="true" />
                      {gift.coinCost.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p role="alert" className="relative shrink-0 text-center text-xs text-destructive">
                {error}
              </p>
            )}

            {/* Send. If the gift costs more than they have, this becomes the buy button. */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!selected || isPending}
              className="relative inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-[#6B4A3A] via-[#8a5f4a] to-[#a8745a] px-4 text-[15px] font-semibold text-white shadow-lg shadow-[#6B4A3A]/40 ring-1 ring-white/15 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : selected && !canAfford ? (
                <>
                  <Coins className="size-4" aria-hidden="true" />
                  Buy {missing.toLocaleString()} more coins
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
      )}

      <BuyCoinsModal
        open={buyOpen}
        onOpenChange={setBuyOpen}
        missingCoins={coinsNeeded}
        onPaymentStarted={onPaymentStarted}
      />
    </>
  );
}