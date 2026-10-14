"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  1-to-1 Calls — Feature Section                                             */
/* -------------------------------------------------------------------------- */

const BULLETS = [
  "Match by language and proficiency",
  "Filter by availability and interests",
  "Reliable low-latency audio",
  "Call history and one-tap call back",
] as const;

export function FeatureCalls() {
  const { isSignedIn } = useUser();

  return (
    <section
      id="calls"
      data-slot="features-calls"
      aria-labelledby="features-calls-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT — copy                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-2 flex flex-col items-start lg:order-1 lg:col-span-6 xl:col-span-6">
          {/* Eyebrow */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            1-to-1 Calls
          </span>

          {/* Heading */}
          <h2
            id="features-calls-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            Talk to real people. Build real confidence.
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            Connect with native speakers and language learners from around the
            world. Practice real conversations, learn about different cultures,
            and build confidence.
          </p>

          {/* Bullets */}
          <ul className="mt-7 flex flex-col gap-3 sm:mt-8">
            {BULLETS.map((item) => (
              <li key={item} className="flex items-start gap-3">
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
                <span className="text-sm font-medium text-foreground sm:text-[0.95rem]">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Explore link — signed out → Clerk modal, signed in → feature page */}
          {isSignedIn ? (
            <Link
              href="/features/calls"
              className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary shadow-none ring-0 transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-9 sm:text-[0.95rem]"
            >
              Explore 1-to-1 calls
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          ) : (
            <SignUpButton
              mode="modal"
              forceRedirectUrl="/app"
              signInForceRedirectUrl="/app"
            >
              <button
                type="button"
                className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary shadow-none ring-0 transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-9 sm:text-[0.95rem]"
              >
                Explore 1-to-1 calls
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </SignUpButton>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT — calls image (light + dark swap)                             */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6">
          <div className="relative mx-auto w-full max-w-[520px] sm:max-w-[580px] lg:max-w-none">
            {/* Light mode */}
            <Image
              src="/images/features/light-calls.png"
              alt="NARRO 1-to-1 calls showing two verified language partners with Call and Message buttons"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              className="h-auto w-full select-none rounded-none object-contain shadow-none ring-0 outline-none dark:hidden"
            />

            {/* Dark mode — radial mask fades any baked-in rectangular edge */}
            <Image
              src="/images/features/dark-calls.png"
              alt="NARRO 1-to-1 calls showing two verified language partners with Call and Message buttons"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              className={[
                "hidden h-auto w-full select-none rounded-none object-contain",
                "shadow-none ring-0 outline-none",
                "dark:block",
                "dark:mask-[radial-gradient(ellipse_58%_58%_at_center,black_58%,transparent_88%)]",
                "dark:[-webkit-mask-image:radial-gradient(ellipse_58%_58%_at_center,black_58%,transparent_88%)]",
              ].join(" ")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}