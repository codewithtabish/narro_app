"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import { Check, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { COMPARISON, PLANS, type Plan } from "@/data/plans";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type BillingCycle = "MONTHLY" | "YEARLY";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Yearly = 12 months charged upfront, 40% off.
 * Adjust the multiplier here if pricing changes.
 */
function getYearlyPrice(monthly: number): number {
  const discounted = monthly * 12 * 0.6;
  return Math.round(discounted * 100) / 100;
}

function formatUSD(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(2);
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function PricingPlans() {
  const [cycle, setCycle] = React.useState<BillingCycle>("MONTHLY");

  return (
    <section
      id="plans"
      data-slot="pricing-plans"
      aria-labelledby="pricing-plans-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      {/* ================================================================== */}
      {/* HERO + TOGGLE                                                       */}
      {/* ================================================================== */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
          Pricing
        </span>

        <h1
          id="pricing-plans-heading"
          className="mt-6 font-serif text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-balance text-foreground sm:mt-7 sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem]"
        >
          Simple pricing.
          <br className="hidden sm:block" /> Real speaking practice.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg lg:text-[1.1rem] lg:leading-[1.7]">
          Start free with 10 minutes of AI voice practice and unlimited
          access to 1-to-1 calls and rooms. Upgrade for more AI minutes —
          cancel anytime.
        </p>

        {/* Billing cycle toggle */}
        <div className="relative mt-8 inline-flex items-center rounded-full bg-secondary p-1 sm:mt-10">
          <button
            type="button"
            onClick={() => setCycle("MONTHLY")}
            aria-pressed={cycle === "MONTHLY"}
            className={cn(
              "relative z-10 inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors duration-200 sm:px-6",
              cycle === "MONTHLY"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:text-foreground",
            )}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() => setCycle("YEARLY")}
            aria-pressed={cycle === "YEARLY"}
            className={cn(
              "relative z-10 inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-200 sm:px-6",
              cycle === "YEARLY"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:text-foreground",
            )}
          >
            Yearly
            <span className="hidden rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary sm:inline-block">
              Save 40%
            </span>
          </button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* PLAN CARDS                                                          */}
      {/* ================================================================== */}
      <ul className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-6 sm:mt-14 md:grid-cols-2 md:gap-6 lg:mt-16 lg:gap-8">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} />
        ))}
      </ul>

      {/* Footnote */}
      <p className="mt-8 text-center text-xs text-muted-foreground sm:text-sm">
        All plans include unlimited 1-to-1 calls and speaking rooms. Cancel
        anytime.
      </p>

      {/* ================================================================== */}
      {/* COMPARISON TABLE                                                    */}
      {/* ================================================================== */}
      <div className="mt-16 w-full rounded-3xl bg-primary/5 px-4 py-14 sm:mt-20 sm:px-8 sm:py-16 lg:mt-24 lg:px-12 lg:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            Plan comparison
          </span>

          <h2 className="mt-5 font-serif text-[1.5rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[1.75rem] lg:text-[2rem]">
            Find the plan that fits you.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            See what&apos;s included in each plan and choose the best option
            for your speaking goals.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-4xl sm:mt-12">
          <ComparisonTable />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PlanCard                                                                   */
/* -------------------------------------------------------------------------- */

function PlanCard({
  plan,
  cycle,
}: {
  plan: Plan;
  cycle: BillingCycle;
}) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const monthly = plan.priceUSD;
  const yearly = getYearlyPrice(plan.priceUSD);

  const displayPrice = cycle === "MONTHLY" ? monthly : yearly;
  const periodLabel = cycle === "MONTHLY" ? "/ month" : "/ year";

  const subline =
    cycle === "MONTHLY" ? `Billed monthly` : `Billed yearly · save 40%`;

  const ctaLabel = plan.popular
    ? `Upgrade to ${plan.name}`
    : `Choose ${plan.name}`;

  const ctaClasses = cn(
    "mt-8 inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition-colors",
    plan.popular
      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
      : "bg-secondary text-foreground hover:bg-secondary/80",
  );

  /* ------------------------------------------------------------------ */
  /*  Handle signed-in click — send user to /app/upgrade with params     */
  /* ------------------------------------------------------------------ */
  const handleSignedInClick = () => {
    router.push(
      `/app/upgrade?plan=${plan.id.toLowerCase()}&cycle=${cycle.toLowerCase()}`,
    );
  };

  return (
    <li
      className={cn(
        "relative flex flex-col rounded-3xl bg-card p-6 shadow-sm sm:p-8",
        plan.popular ? "ring-2 ring-primary/40" : "ring-1 ring-border/60",
      )}
    >
      {/* Most popular ribbon */}
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground shadow-sm">
          Most popular
        </span>
      )}

      {/* Header */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-foreground sm:text-xl">
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

        {/* Price */}
        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            ${formatUSD(displayPrice)}
          </span>
          <span className="text-sm text-muted-foreground">
            {periodLabel}
          </span>
        </div>
        <p className="mt-1 text-xs italic text-muted-foreground">
          {subline}
        </p>
      </div>

      {/* Divider */}
      <div aria-hidden="true" className="mt-6 h-px w-full bg-border" />

      {/* Features */}
      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10"
            >
              <Check
                className="h-3 w-3 text-primary"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </span>
            <span className="text-sm text-foreground">{f}</span>
          </li>
        ))}
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* CTA — signed out → Clerk modal, signed in → /app/upgrade            */}
      {/* ------------------------------------------------------------------ */}
      {isSignedIn ? (
        <button
          type="button"
          onClick={handleSignedInClick}
          className={ctaClasses}
        >
          {ctaLabel}
        </button>
      ) : (
        <SignUpButton
          mode="modal"
          forceRedirectUrl={`/app/upgrade?plan=${plan.id.toLowerCase()}&cycle=${cycle.toLowerCase()}`}
          signInForceRedirectUrl={`/app/upgrade?plan=${plan.id.toLowerCase()}&cycle=${cycle.toLowerCase()}`}
        >
          <button type="button" className={ctaClasses}>
            {ctaLabel}
          </button>
        </SignUpButton>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  ComparisonTable                                                            */
/* -------------------------------------------------------------------------- */

function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
      {/* Header row */}
      <div className="grid grid-cols-3 border-b border-border/60 px-4 py-4 sm:px-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Features
        </div>
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Basic
        </div>
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground">
            Pro
          </span>
        </div>
      </div>

      {/* Rows */}
      <ul>
        {COMPARISON.map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-3 items-center border-b border-border/60 px-4 py-3.5 last:border-b-0 sm:px-6"
          >
            <span className="text-sm text-foreground">{row.label}</span>

            <span className="flex justify-center">
              <CellValue value={row.basic} />
            </span>

            <span className="flex justify-center">
              <CellValue value={row.pro} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <Check
        className="h-4 w-4 text-primary"
        strokeWidth={2.5}
        aria-label="Included"
      />
    );
  }
  if (value === false) {
    return (
      <Minus
        className="h-4 w-4 text-muted-foreground/60"
        strokeWidth={2.5}
        aria-label="Not included"
      />
    );
  }
  return (
    <span className="text-center text-sm text-muted-foreground">
      {value}
    </span>
  );
}