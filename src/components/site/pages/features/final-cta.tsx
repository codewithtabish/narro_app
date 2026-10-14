"use client";

import { SignUpButton } from "@clerk/nextjs";
import Image from "next/image";

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
/*  Final CTA — Section                                                        */
/* -------------------------------------------------------------------------- */

export function FeaturesFinalCta() {
  return (
    <section
      id="final-cta"
      data-slot="features-final-cta"
      aria-labelledby="features-final-cta-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      <div className="relative w-full overflow-hidden rounded-3xl">
        {/* ------------------------------------------------------------------ */}
        {/* BACKGROUND IMAGE                                                    */}
        {/* ------------------------------------------------------------------ */}
        <Image
          src="/images/features/final-cta-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
          aria-hidden="true"
        />

        {/* ------------------------------------------------------------------ */}
        {/* LIGHT SCRIM — keeps text readable in both modes                     */}
        {/* ------------------------------------------------------------------ */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-background/70 via-background/40 to-background/70"
        />

        {/* ------------------------------------------------------------------ */}
        {/* CONTENT — centered                                                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 flex flex-col items-center px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:py-28">
          {/* Heading */}
          <h2
            id="features-final-cta-heading"
            className="max-w-3xl font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-balance text-foreground sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3rem]"
          >
            Your next conversation
            <br className="hidden sm:block" /> is just a tap away.
          </h2>

          {/* Subhead */}
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base lg:text-[1.05rem]">
            Join thousands of learners who are already speaking with
            confidence using NARRO.
          </p>

          {/* CTA buttons */}
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
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-background/80 px-7 text-[0.9rem] font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-background/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <GooglePlayLogo className="h-4 w-4" />
                Get it on Android
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </section>
  );
}