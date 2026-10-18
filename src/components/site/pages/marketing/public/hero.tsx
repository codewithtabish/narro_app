// src/components/public/hero.tsx
import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */
/**
 * Public landing page hero.
 *
 * Uses design tokens from globals.css (bg-background, text-foreground, etc.)
 * so it inherits light + dark mode automatically. No hardcoded colors.
 *
 * The outer <section> handles its own vertical padding only —
 * horizontal padding is provided by the parent layout container.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-10 lg:pb-24 lg:pt-12">
      {/* Decorative voice ribbons — subtle background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <svg
          className="absolute left-1/2 top-1/2 h-[600px] w-[1600px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
          viewBox="0 0 1600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 300 C 200 100, 400 500, 700 300 S 1200 100, 1700 300"
            stroke="var(--color-primary, #6B4A3A)"
            strokeWidth="80"
            strokeLinecap="round"
          />
          <path
            d="M-100 380 C 300 180, 500 480, 800 320 S 1300 140, 1700 340"
            stroke="var(--color-accent, #635BDB)"
            strokeWidth="60"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Eyebrow pill */}
        <span className="inline-flex items-center rounded-full bg-[#E8E5FF] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#635BDB] dark:bg-[#635BDB]/20 dark:text-[#9387F5]">
          Three ways to speak
        </span>

        {/* Headline */}
        <h1 className="mt-5 font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-6xl">
          Talk to AI. Talk to people.
          <br />
          Speak better.
        </h1>

        {/* Subheadline */}
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          One-to-one calls, group rooms, and AI conversations — all in one
          place. Every voice counts.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          {/* Primary */}
          <Link
            href="/#get-started"
            className={cn(
              "inline-flex h-14 items-center gap-2 rounded-full px-7",
              "bg-primary text-primary-foreground",
              "text-[15px] font-semibold",
              "shadow-[0_12px_32px_-12px_var(--color-primary)]",
              "transition-all duration-200",
              "hover:bg-primary/90",
              "active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          >
            <Phone className="h-[18px] w-[18px]" strokeWidth={2.25} />
            Start speaking free
          </Link>

          {/* Secondary */}
          <Link
            href="/#community"
            className={cn(
              "inline-flex h-14 items-center gap-2 rounded-full px-7",
              "border border-border bg-background text-foreground",
              "text-[15px] font-semibold",
              "transition-all duration-200",
              "hover:bg-secondary",
              "active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          >
            Explore community
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </section>
  );
}