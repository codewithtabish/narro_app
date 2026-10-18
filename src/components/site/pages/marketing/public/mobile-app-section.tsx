// src/components/public/mobile-app-section.tsx
"use client";

import { motion } from "framer-motion";
import { Apple, Play } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Motion                                                                     */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerParent = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * "Take your speaking anywhere." mobile-app section.
 *
 * Layout:
 *   - Desktop: phone mockup left, copy right.
 *   - Mobile: phone mockup on top, copy below.
 *
 * Theming:
 *   - Semantic tokens only so light and dark mode both work.
 *   - Phone mockup has NO border, NO ring, NO outline, NO shadow.
 *   - Dark-mode image has a radial mask so any baked-in rectangle
 *     background fades into the page (no hard edge).
 *
 * Rules:
 *   - No horizontal padding — parent <Container> handles it.
 *   - Uses Next.js <Image>.
 */
export function MobileAppSection() {
  return (
    <section
      aria-labelledby="mobile-app-heading"
      className="pb-10 sm:pb-12 lg:pb-14"
    >
      {/* Cream panel wrapping the whole section */}
      <div
        className={cn(
          "overflow-hidden rounded-[28px] border border-border/60",
          "bg-muted/50",
          "grid grid-cols-1 items-center",
          "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]",
        )}
      >
        {/* ================================================================ */}
        {/* LEFT — phone mockup                                              */}
        {/* ================================================================ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className={cn(
            "relative",
            "order-2 lg:order-1",
            "px-6 pt-8 sm:px-10 sm:pt-10 lg:px-12 lg:pt-12",
            "pb-0",
          )}
        >
          <div className="relative mx-auto w-full max-w-[420px]">
            {/* Soft brand glow behind the phone — replaces any hard edge */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 scale-[0.9] rounded-[40px] bg-primary/5 blur-3xl"
            />

            <Image
              src="/images/marketing/app-mockup.webp"
              alt="NARRO mobile app showing speaking progress and quick actions"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              className={cn(
                // Kill any browser default ring / border / outline / shadow
                "h-auto w-full select-none object-contain",
                "border-0 ring-0 outline-none shadow-none",
                // In dark mode, fade the outer edge of the image so any
                // baked-in dark rectangle blends into the panel.
                "dark:mask-[radial-gradient(ellipse_72%_72%_at_center,black_65%,transparent_95%)]",
                "dark:[-webkit-mask-image:radial-gradient(ellipse_72%_72%_at_center,black_65%,transparent_95%)]",
              )}
              style={{
                // Belt-and-braces: guarantee no inherited border/shadow
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* RIGHT — copy + store badges                                      */}
        {/* ================================================================ */}
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className={cn(
            "order-1 lg:order-2",
            "relative",
            "px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14",
          )}
        >
          {/* Eyebrow pill */}
          <motion.span
            variants={fadeUp}
            className={cn(
              "inline-flex w-fit items-center rounded-full",
              "bg-accent px-3.5 py-1.5",
              "text-[10px] font-bold uppercase tracking-[0.16em]",
              "text-accent-foreground",
            )}
          >
            On the go
          </motion.span>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            id="mobile-app-heading"
            className={cn(
              "mt-3 max-w-[420px] font-serif text-[34px] font-normal leading-[1.08]",
              "tracking-[-0.02em] text-foreground",
              "sm:text-[40px] lg:text-[44px]",
            )}
          >
            Take your speaking
            <br />
            anywhere.
          </motion.h2>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            className={cn(
              "mt-3 max-w-[440px] text-[15px] leading-relaxed",
              "text-muted-foreground sm:text-[16px]",
            )}
          >
            Join calls, enter rooms, and practice with AI — all from your phone.
            Learn on your schedule, at your pace.
          </motion.p>

          {/* Store badges */}
          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            {/* App Store */}
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download NARRO on the App Store"
              className={cn(
                "inline-flex items-center gap-2.5 rounded-xl",
                "bg-foreground text-background",
                "px-4 py-2.5",
                "transition-transform duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Apple
                className="h-5 w-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="flex flex-col leading-none">
                <span className="text-[9px] uppercase tracking-wide opacity-80">
                  Download on the
                </span>
                <span className="mt-0.5 text-[13px] font-semibold">
                  App Store
                </span>
              </span>
            </a>

            {/* Google Play */}
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get NARRO on Google Play"
              className={cn(
                "inline-flex items-center gap-2.5 rounded-xl",
                "bg-foreground text-background",
                "px-4 py-2.5",
                "transition-transform duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Play
                className="h-5 w-5 shrink-0 fill-current"
                strokeWidth={0}
                aria-hidden="true"
              />
              <span className="flex flex-col leading-none">
                <span className="text-[9px] uppercase tracking-wide opacity-80">
                  Get it on
                </span>
                <span className="mt-0.5 text-[13px] font-semibold">
                  Google Play
                </span>
              </span>
            </a>
          </motion.div>

          {/* Handwritten annotation */}
          <motion.span
            variants={fadeUp}
            aria-hidden="true"
            className={cn(
              "pointer-events-none hidden select-none lg:block",
              "absolute right-10 top-12 rotate-[8deg]",
              "font-serif text-[15px] italic leading-[1.35]",
              "text-primary/80",
            )}
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Speak more.
            <br />
            Live bigger.
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}