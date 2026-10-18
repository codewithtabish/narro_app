// src/components/public/community-section.tsx
"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Motion presets                                                             */
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

const imageTile = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* -------------------------------------------------------------------------- */
/*  Stats                                                                      */
/* -------------------------------------------------------------------------- */

const STATS = [
  { value: "120K+", label: "Active learners" },
  { value: "180+", label: "Languages" },
  { value: "12K+", label: "Daily rooms" },
  { value: "4.9", label: "App rating", isRating: true },
] as const;

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * "Real conversations. Real progress." community section.
 *
 * Theming:
 *   - Uses ONLY semantic tokens (foreground, muted-foreground, border,
 *     primary, accent, card) so light and dark mode both render correctly
 *     via shadcn's CSS variables.
 *
 * Rules:
 *   - No horizontal padding here — parent <Container> handles it.
 *   - Tight vertical rhythm throughout.
 *   - Uses Next.js <Image> with the marketing .webp assets.
 */
export function CommunitySection() {
  return (
    <section
      aria-labelledby="community-heading"
      className="pb-10 sm:pb-12 lg:pb-14"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
        {/* ================================================================ */}
        {/* LEFT — copy + stats                                              */}
        {/* ================================================================ */}
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col"
        >
          {/* Eyebrow pill */}
          <motion.span
            variants={fadeUp}
            className={cn(
              "inline-flex w-fit items-center rounded-full",
              "bg-accent px-3.5 py-1.5",
              "text-[10px] font-bold uppercase tracking-[0.14em]",
              "text-accent-foreground",
            )}
          >
            A Global Community
          </motion.span>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            id="community-heading"
            className={cn(
              "mt-3 font-serif text-[34px] font-normal leading-[1.08]",
              "tracking-[-0.02em] text-foreground",
              "sm:text-[40px] lg:text-[46px]",
            )}
          >
            Real conversations.
            <br />
            Real progress.
          </motion.h2>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            className={cn(
              "mt-3 max-w-[460px] text-[15px] leading-relaxed",
              "text-muted-foreground sm:text-[16px]",
            )}
          >
            Join thousands of learners around the world who are building
            confidence, making friends, and speaking new languages — every day.
          </motion.p>

          {/* Stats row */}
          <motion.dl
            variants={fadeUp}
            className={cn(
              "mt-6 grid grid-cols-2 gap-x-6 gap-y-5",
              "sm:grid-cols-4 sm:gap-x-4",
            )}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="sr-only">{stat.label}</dt>
                <dd
                  className={cn(
                    "flex items-baseline gap-1",
                    "font-serif text-[22px] font-normal leading-none",
                    "text-foreground sm:text-[24px]",
                  )}
                >
                  {stat.value}
                  {"isRating" in stat && stat.isRating ? (
                    <Star
                      className="h-[14px] w-[14px] fill-amber-400 text-amber-400"
                      strokeWidth={0}
                      aria-hidden="true"
                    />
                  ) : null}
                </dd>
                <span className="mt-1.5 text-[12.5px] text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ================================================================ */}
        {/* RIGHT — staggered 4-tile photo grid + annotation                 */}
        {/* ================================================================ */}
        <div className="relative">
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className={cn(
              "grid gap-3 sm:gap-4",
              "grid-cols-2",
              "lg:grid-cols-[1.15fr_1fr]",
            )}
          >
            {/* Tile 1 — top-left, TALL */}
            <motion.div
              variants={imageTile}
              className={cn(
                "relative aspect-4/5 overflow-hidden rounded-2xl",
                "border border-border",
              )}
            >
              <Image
                src="/images/marketing/community-1.webp"
                alt="Learner laughing in warm interior"
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 320px"
                className="object-cover"
              />
            </motion.div>

            {/* Tile 2 — top-right, SQUARE */}
            <motion.div
              variants={imageTile}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl",
                "border border-border",
              )}
            >
              <Image
                src="/images/marketing/community-2.webp"
                alt="Learner smiling indoors"
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 280px"
                className="object-cover"
              />
            </motion.div>

            {/* Tile 3 — bottom-left, SQUARE */}
            <motion.div
              variants={imageTile}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl",
                "border border-border",
              )}
            >
              <Image
                src="/images/marketing/community-3.webp"
                alt="Learner waving at the camera"
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 320px"
                className="object-cover"
              />
            </motion.div>

            {/* Tile 4 — bottom-right, TALL */}
            <motion.div
              variants={imageTile}
              className={cn(
                "relative aspect-4/5 overflow-hidden rounded-2xl",
                "border border-border",
              )}
            >
              <Image
                src="/images/marketing/community-4.webp"
                alt="Learner outdoors wearing a hat"
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 280px"
                className="object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Handwritten annotation — right of grid on desktop */}
          <motion.span
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            aria-hidden="true"
            className={cn(
              "pointer-events-none hidden select-none lg:block",
              "absolute -right-12 top-1/2 -translate-y-1/2 rotate-[8deg]",
              "font-serif text-[15px] italic leading-[1.35]",
              "text-primary/80",
            )}
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Different
            <br />
            people.
            <br />
            Same goal.
          </motion.span>
        </div>
      </div>
    </section>
  );
}