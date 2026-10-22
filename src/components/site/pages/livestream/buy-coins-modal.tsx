"use client";

import { Check, Coins, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { createCoinCheckout } from "@/app/actions/coins/create-checkout";
import {
    COINS_PER_USD,
    MAX_USD,
    MIN_USD,
    QUICK_PACKS,
    bonusPctForUsd,
    coinsForUsd,
    formatUsd,
} from "@/data/coins";
import { cn } from "@/lib/utils";

interface BuyCoinsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Coins the user still needs. Pre-selects the smallest pack that covers it. */
  missingCoins?: number;
  /** Called once the payment tab is open, so the caller can start watching the balance. */
  onPaymentStarted?: () => void;
}

/**
 * Mounts the panel only while open, so every open starts fresh
 * (state is initialised from props, no reset effect needed).
 */
export function BuyCoinsModal({ open, ...rest }: BuyCoinsModalProps) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(<BuyPanel {...rest} />, document.body);
}

function initialPack(missingCoins: number): number {
  if (missingCoins > 0) {
    return (
      QUICK_PACKS.find((p) => coinsForUsd(p) >= missingCoins) ??
      QUICK_PACKS[QUICK_PACKS.length - 1]
    );
  }
  return QUICK_PACKS[1] ?? QUICK_PACKS[0];
}

function BuyPanel({
  onOpenChange,
  missingCoins = 0,
  onPaymentStarted,
}: Omit<BuyCoinsModalProps, "open">) {
  const [pack, setPack] = useState<number>(() => initialPack(missingCoins));
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  const usingCustom = custom !== "";
  const amount = usingCustom ? Number(custom) : pack;
  const valid = Number.isInteger(amount) && amount >= MIN_USD && amount <= MAX_USD;
  const coins = valid ? coinsForUsd(amount) : 0;
  const bonus = valid ? coins - amount * COINS_PER_USD : 0;
  const bestPack = QUICK_PACKS[QUICK_PACKS.length - 1];
  const popularPack = QUICK_PACKS[1];

  /* Escape to close, lock page scroll, move focus into the dialog */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onOpenChange(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isPending, onOpenChange]);

  function handlePay() {
    if (!valid || isPending) return;
    setError(null);

    // Open the tab inside the click itself, or browsers block it as a popup.
    // The stream tab is never redirected, so the live video keeps playing.
    const tab = window.open("about:blank", "_blank");
    if (tab) {
      try {
        tab.opener = null;
        tab.document.write(
          '<title>Payment</title><body style="margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#555">Opening secure payment…</body>',
        );
      } catch {
        /* a blank tab is fine */
      }
    }

    startTransition(async () => {
      try {
        const res = await createCoinCheckout({ amountUsd: amount });
        if (!res.success) {
          tab?.close();
          setError(res.error);
          return;
        }

        onPaymentStarted?.();

        if (tab && !tab.closed) {
          tab.location.href = res.url;
          onOpenChange(false);
        } else {
          // Popup blocked (common in in-app browsers): hand over a link instead.
          setFallbackUrl(res.url);
        }
      } catch {
        tab?.close();
        setError("Something went wrong. Please try again.");
      }
    });
  }

  const payButtonClass =
    "relative inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-[#6B4A3A] via-[#8a5f4a] to-[#a8745a] px-4 text-[15px] font-semibold text-white shadow-lg shadow-[#6B4A3A]/40 ring-1 ring-white/15 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={() => !isPending && onOpenChange(false)}
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="buy-coins-title"
        className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-card text-card-foreground shadow-2xl outline-none animate-in slide-in-from-bottom-8 fade-in duration-200 sm:max-w-md sm:rounded-[28px] sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        {/* ambient glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[#6B4A3A]/40 blur-3xl"
          aria-hidden="true"
        />

        {/* ───────── Header (fixed) ───────── */}
        <div className="relative shrink-0 px-5 pt-3 sm:pt-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-300/25 to-amber-500/10 ring-1 ring-amber-400/30">
                <Coins className="size-5 text-amber-400" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2
                  id="buy-coins-title"
                  className="text-lg font-semibold leading-tight tracking-tight text-foreground"
                >
                  Buy coins
                </h2>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {missingCoins > 0
                    ? `You need ${missingCoins.toLocaleString()} more coins for this gift.`
                    : "Coins let you send gifts to hosts."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              aria-label="Close"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ───────── Body (scrolls) ───────── */}
        <div className="relative flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          {/* Packs */}
          <div
            role="radiogroup"
            aria-label="Choose a coin pack"
            className="grid grid-cols-2 gap-3"
          >
            {QUICK_PACKS.map((p) => {
              const active = !usingCustom && p === pack;
              const pct = bonusPctForUsd(p);
              const tag =
                p === bestPack ? "Best value" : p === popularPack ? "Popular" : null;

              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={isPending}
                  onClick={() => {
                    setPack(p);
                    setCustom("");
                    setError(null);
                  }}
                  className={cn(
                    "group relative flex min-h-[112px] shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border px-2 py-4 transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.97] disabled:opacity-60",
                    active
                      ? "border-[#a8745a] bg-linear-to-b from-[#6B4A3A]/30 to-[#6B4A3A]/10 shadow-[0_8px_30px_-10px_#6B4A3A]"
                      : "border-border bg-background/50 hover:-translate-y-0.5 hover:border-white/20 hover:bg-accent",
                  )}
                >
                  {tag && (
                    <span
                      className={cn(
                        "absolute left-0 top-0 rounded-br-xl px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        p === bestPack
                          ? "bg-amber-400 text-black"
                          : "bg-white/10 text-foreground/80",
                      )}
                    >
                      {tag}
                    </span>
                  )}

                  {active && (
                    <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-[#a8745a] text-white">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}

                  <span className="flex items-center gap-1.5 text-xl font-bold tabular-nums tracking-tight text-foreground">
                    <Coins className="size-[18px] text-amber-400" aria-hidden="true" />
                    {coinsForUsd(p).toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatUsd(p)}
                  </span>

                  {/* reserved row so every card has the same height */}
                  <span className="flex h-[18px] items-center justify-center">
                    {pct > 0 && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">
                        +{pct}% bonus
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex shrink-0 items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              or custom
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Custom amount */}
          <div className="flex shrink-0 flex-col gap-2">
            <label htmlFor="custom-amount" className="text-xs text-muted-foreground">
              Enter your own amount ({formatUsd(MIN_USD)} to {formatUsd(MAX_USD)})
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground"
                aria-hidden="true"
              >
                $
              </span>
              <input
                id="custom-amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={custom}
                disabled={isPending}
                onChange={(e) => {
                  setCustom(e.target.value.replace(/\D/g, "").slice(0, 4));
                  setError(null);
                }}
                placeholder={MIN_USD.toLocaleString()}
                aria-invalid={usingCustom && !valid}
                aria-describedby={usingCustom && !valid ? "custom-amount-error" : undefined}
                className={cn(
                  "h-12 w-full rounded-2xl border bg-background/60 pl-9 pr-4 text-[16px] font-medium tabular-nums text-foreground outline-none transition-all placeholder:text-muted-foreground/50 disabled:opacity-60",
                  "focus:border-[#a8745a] focus:ring-4 focus:ring-[#6B4A3A]/30",
                  usingCustom && !valid ? "border-destructive/60" : "border-border",
                )}
              />
            </div>
            {usingCustom && !valid && (
              <p id="custom-amount-error" className="text-xs text-destructive">
                Enter a whole amount between {formatUsd(MIN_USD)} and {formatUsd(MAX_USD)}.
              </p>
            )}
          </div>
        </div>

        {/* ───────── Footer (always visible) ───────── */}
        <div className="relative flex shrink-0 flex-col gap-3 border-t border-white/10 bg-card px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* What you get */}
          <div
            aria-live="polite"
            className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-linear-to-r from-amber-400/10 to-amber-400/5 px-4 py-3"
          >
            <span className="text-sm text-muted-foreground">You get</span>
            <span className="flex items-center gap-2 text-lg font-bold tabular-nums text-amber-500 dark:text-amber-300">
              <Coins className="size-5" aria-hidden="true" />
              {valid ? coins.toLocaleString() : "0"}
              {bonus > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">
                  +{bonus.toLocaleString()} bonus
                </span>
              )}
            </span>
          </div>

          {error && (
            <p role="alert" className="shrink-0 text-center text-xs text-destructive">
              {error}
            </p>
          )}

          {fallbackUrl ? (
            <div className="flex shrink-0 flex-col gap-2">
              <p role="status" className="text-center text-xs text-muted-foreground">
                Your browser blocked the payment tab. Open it from here instead.
              </p>
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenChange(false)}
                className={payButtonClass}
              >
                Open payment page
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePay}
              disabled={!valid || isPending}
              className={payButtonClass}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Opening payment…
                </>
              ) : valid ? (
                <>
                  <Lock className="size-4" aria-hidden="true" />
                  Pay {formatUsd(amount)}
                </>
              ) : (
                "Enter a valid amount"
              )}
            </button>
          )}

          <p className="flex shrink-0 items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
            Secure checkout by Safepay. Opens in a new tab so the stream keeps playing.
          </p>
        </div>
      </div>
    </div>
  );
}