export const CURRENCY = "USD";

/** Base rate: coins given per 1 USD, before any bonus. Change to your rate. */
export const COINS_PER_USD = 100;

/** Minimum and maximum purchase in whole US dollars. Change to your limits. */
export const MIN_USD = 2;
export const MAX_USD = 200;

/** Quick-pick packs in USD. Keep ascending: the last one is shown as "Best value". */
export const QUICK_PACKS: number[] = [2, 5, 10, 25];

/** Bonus tiers, checked from highest to lowest. */
const BONUS_TIERS: { minUsd: number; pct: number }[] = [
  { minUsd: 25, pct: 20 },
  { minUsd: 10, pct: 10 },
  { minUsd: 5, pct: 5 },
];

/** Bonus percentage for a given USD amount (0 if no tier applies). */
export function bonusPctForUsd(usd: number): number {
  return BONUS_TIERS.find((t) => usd >= t.minUsd)?.pct ?? 0;
}

/** Total coins (base + bonus) for a given USD amount. Always a whole number. */
export function coinsForUsd(usd: number): number {
  const base = usd * COINS_PER_USD;
  return Math.round(base * (1 + bonusPctForUsd(usd) / 100));
}

/** Format a USD amount, e.g. 5 -> "$5". */
export function formatUsd(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(usd);
}