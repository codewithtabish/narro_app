"use client";

import { SignUpButton } from "@clerk/nextjs";
import {
    BarChart3,
    Mic,
    Phone,
    Users,
    type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Brand logos (inline — Apple & Google Play aren't in lucide)                */
/* -------------------------------------------------------------------------- */

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.47 2.23-1.24 3.03-.78.81-2.05 1.44-3.09 1.36-.13-1.11.45-2.3 1.19-3.07.83-.86 2.24-1.48 3.14-1.32zM20.8 17.02c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.38 3.5-4.1 3.52-1.53.02-1.93-.98-4.01-.97-2.08.01-2.52 1-4.05.98-1.72-.02-3.04-1.77-4.03-3.32C-.55 16.03-.86 10.66 1.03 7.86c1.28-1.97 3.32-3.13 5.24-3.13 1.95 0 3.17 1.05 4.78 1.05 1.56 0 2.51-1.05 4.76-1.05 1.71 0 3.52.92 4.82 2.51-4.24 2.3-3.55 8.27.17 9.78z" />
    </svg>
  );
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .61-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.24 12l2.458-2.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feature overview data                                                      */
/* -------------------------------------------------------------------------- */

type OverviewItem = {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
};

const OVERVIEW: OverviewItem[] = [
  {
    Icon: Mic,
    title: "AI Practice",
    subtitle: "Speak with AI, anytime",
  },
  {
    Icon: Phone,
    title: "1-to-1 Calls",
    subtitle: "Real people, real conversations",
  },
  {
    Icon: Users,
    title: "Speaking Rooms",
    subtitle: "Join live group rooms",
  },
  {
    Icon: BarChart3,
    title: "Progress",
    subtitle: "Track your growth",
  },
];

/* -------------------------------------------------------------------------- */
/*  Hero + Overview                                                            */
/* -------------------------------------------------------------------------- */

export function FeaturesHero() {
  return (
    <section
      data-slot="features-hero"
      aria-labelledby="features-hero-heading"
      className="relative w-full pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 xl:pt-24 xl:pb-28"
    >
      {/* ================================================================== */}
      {/* TOP — HERO                                                          */}
      {/* ================================================================== */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
          Features
        </span>

        <h1
          id="features-hero-heading"
          className="mt-6 font-serif text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-balance text-foreground sm:mt-7 sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem]"
        >
          Everything you need
          <br className="hidden sm:block" /> to start speaking.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg lg:text-[1.1rem] lg:leading-[1.7]">
          AI voice practice, 1-to-1 human calls, live speaking rooms, and
          meaningful progress tracking — all designed to get you speaking with
          confidence, faster.
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <SignUpButton
            mode="modal"
            forceRedirectUrl="/app"
            signInForceRedirectUrl="/app"
          >
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-primary px-7 text-[0.9rem] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <AppleLogo className="h-4 w-4" />
              Download for iOS
            </button>
          </SignUpButton>

          <SignUpButton
            mode="modal"
            forceRedirectUrl="/app"
            signInForceRedirectUrl="/app"
          >
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-secondary px-7 text-[0.9rem] font-semibold text-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <GooglePlayLogo className="h-4 w-4" />
              Get it on Android
            </button>
          </SignUpButton>
        </div>
      </div>

      {/* ================================================================== */}
      {/* BOTTOM — FEATURE OVERVIEW STRIP (peach band)                        */}
      {/* ================================================================== */}
      <div className="mt-16 w-full rounded-3xl bg-primary/5 px-6 py-10 sm:mt-20 sm:px-10 sm:py-12 lg:mt-24 lg:py-14">
        <ol className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-8 sm:gap-10 md:flex-row md:items-start md:justify-between md:gap-4">
          {OVERVIEW.map((item, index) => (
            <li
              key={item.title}
              className="relative flex flex-1 flex-col items-center text-center"
            >
              {/* Dotted connector — between chips on md+ */}
              {index !== OVERVIEW.length - 1 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-5 hidden w-[calc(100%+1rem)] md:block"
                >
                  <span className="block border-t border-dashed border-primary/40" />
                </span>
              )}

              {/* Icon badge */}
              <span
                aria-hidden="true"
                className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
              >
                <item.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>

              {/* Title */}
              <span className="mt-3 text-sm font-semibold text-foreground sm:text-[0.95rem]">
                {item.title}
              </span>

              {/* Subtitle */}
              <span className="mt-1 text-xs text-muted-foreground sm:text-[0.8rem]">
                {item.subtitle}
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center text-xs text-muted-foreground sm:mt-12 sm:text-sm">
          Four ways to practice. One app.
        </p>
      </div>
    </section>
  );
}