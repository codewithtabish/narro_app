// src/data/plans.ts

export type PlanId = "BASIC" | "PRO";

export type Plan = {
  id: PlanId;
  name: string;
  priceUSD: number;
  priceCents: number;
  /** AI speaking minutes included per month */
  aiMinutesPerMonth: number;
  tagline: string;
  features: string[];
  popular?: boolean;
  /** Safepay's real Plan ID (plan_...) */
  safepayPlanId: string;
};

export const PLANS: Plan[] = [
  {
    id: "BASIC",
    name: "Basic",
    priceUSD: 4.99,
    priceCents: 499,
    aiMinutesPerMonth: 120,
    tagline: "Start speaking every day",
    safepayPlanId: "plan_aec3858a-9783-456f-a515-12b5c0f34143",
    features: [
      "120 AI speaking minutes / month",
      "Unlimited 1-to-1 human calls",
      "Join unlimited speaking rooms",
      "Basic progress tracking",
      "Cancel anytime",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    priceUSD: 7.99,
    priceCents: 799,
    aiMinutesPerMonth: 300,
    tagline: "For serious learners",
    safepayPlanId: "plan_7fb52f9d-bd95-4987-930e-4921e71075cb",
    popular: true,
    features: [
      "300 AI speaking minutes / month",
      "Unlimited 1-to-1 human calls",
      "Priority speaking room access",
      "Detailed progress reports",
      "Advanced pronunciation feedback",
      "Priority support",
    ],
  },
];

export function getPlan(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/* -------------------------------------------------------------------------- */
/*  Comparison table rows                                                      */
/* -------------------------------------------------------------------------- */

export type ComparisonRow = {
  label: string;
  basic: string | boolean;
  pro: string | boolean;
};

export const COMPARISON: ComparisonRow[] = [
  { label: "AI speaking minutes", basic: "120 / month", pro: "300 / month" },
  { label: "1-to-1 human calls", basic: true, pro: true },
  { label: "Speaking rooms", basic: true, pro: true },
  { label: "Priority room access", basic: false, pro: true },
  { label: "Progress tracking", basic: "Basic", pro: "Detailed" },
  { label: "Pronunciation feedback", basic: false, pro: "Advanced" },
  { label: "Priority support", basic: false, pro: true },
  { label: "Cancel anytime", basic: true, pro: true },
];