// src/components/public/features-row.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Headphones, Mic, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Motion presets                                                             */
/* -------------------------------------------------------------------------- */

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* -------------------------------------------------------------------------- */
/*  Card 1 — Talk to real people                                               */
/* -------------------------------------------------------------------------- */

function CardOneToOne() {
  return (
    <motion.article
      variants={cardVariants}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl",
        "bg-[#6B4A3A] text-white",
        "p-7 sm:p-8",
        "min-h-[440px]",
        "ring-1 ring-black/5",
        "transition-shadow duration-300",
        "hover:shadow-[0_24px_60px_-30px_rgba(107,74,58,0.7)]",
      )}
    >
      {/* Top row: pill + phone icon */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
          1-to-1
        </span>
        <Mic className="h-5 w-5 text-white/70" strokeWidth={1.75} />
      </div>

      {/* Heading */}
      <h3 className="mt-5 font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.01em] text-white sm:text-[28px]">
        Talk to real
        <br />
        people.
      </h3>

      {/* Body */}
      <p className="mt-4 max-w-[280px] text-[14px] leading-relaxed text-white/75">
        Match with a learner of your target language. Practice one-to-one —
        privately, anytime, at your own pace.
      </p>

      {/* Portrait pair with wavy connector */}
      <div className="mt-8 flex items-center">
        {/* Left portrait */}
        <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20">
          <Image
            src="/images/marketing/card_one_first.webp"
            alt="Learner portrait"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        {/* Wavy connector — stroke only, transparent */}
        <svg
          aria-hidden="true"
          width="56"
          height="20"
          viewBox="0 0 56 20"
          fill="none"
          className="mx-2 shrink-0"
        >
          <path
            d="M0 10 C 12 1, 20 19, 28 10 S 44 1, 56 10"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Right portrait */}
        <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20">
          <Image
            src="/images/marketing/card_one_second.webp"
            alt="Learner portrait"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Bottom link */}
      <div className="mt-auto pt-8">
        <Link
          href="/app/calls"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-80"
        >
          Find a partner
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </Link>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card 2 — Join a live room                                                  */
/* -------------------------------------------------------------------------- */

const AVATARS = [
  "/images/marketing/avatar1.webp",
  "/images/marketing/avatar2.webp",
  "/images/marketing/avatar3.webp",
  "/images/marketing/avatar4.webp",
] as const;

function CardRooms() {
  return (
    <motion.article
      variants={cardVariants}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl",
        "bg-[#F5F1EC] text-[#24232B]",
        "p-7 sm:p-8",
        "min-h-[440px]",
        "ring-1 ring-[#EAE8F0]",
        "transition-shadow duration-300",
        "hover:shadow-[0_24px_60px_-30px_rgba(36,35,43,0.25)]",
      )}
    >
      {/* Top row: pill + users icon */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B4A3A]">
          Rooms
        </span>
        <Users className="h-5 w-5 text-[#6B4A3A]/70" strokeWidth={1.75} />
      </div>

      {/* Heading */}
      <h3 className="mt-5 font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.01em] text-[#1A1613] sm:text-[28px]">
        Join a live room.
      </h3>

      {/* Body */}
      <p className="mt-4 max-w-[300px] text-[14px] leading-relaxed text-[#777783]">
        Drop into a group conversation with learners from around the world.
        Different topics, same goal — speak.
      </p>

      {/* Overlapping avatars + "+3" badge */}
      <div className="mt-8 flex items-center">
        <div className="flex -space-x-3">
          {AVATARS.map((src, i) => (
            <div
              key={src}
              className="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[#F5F1EC]"
              style={{ zIndex: AVATARS.length - i }}
            >
              <Image
                src={src}
                alt={`Room member ${i + 1}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* +3 badge */}
        <div className="relative -ml-3 flex aspect-square h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#6B4A3A] text-[13px] font-semibold text-white ring-2 ring-[#F5F1EC]">
          +3
        </div>
      </div>

      {/* Bottom link */}
      <div className="mt-auto pt-8">
        <Link
          href="/app/rooms"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#6B4A3A] transition-opacity hover:opacity-80"
        >
          Browse rooms
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </Link>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card 3 — Talk with AI partners                                             */
/* -------------------------------------------------------------------------- */

function CardAI() {
  return (
    <motion.article
      variants={cardVariants}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl",
        "bg-[#E8E5FF] text-[#24232B]",
        "p-7 sm:p-8",
        "min-h-[440px]",
        "ring-1 ring-[#EAE8F0]",
        "transition-shadow duration-300",
        "hover:shadow-[0_24px_60px_-30px_rgba(99,91,219,0.5)]",
      )}
    >
      {/* Top row: pill + sparkles icon */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#635BDB]">
          AI Learning
        </span>
        <Sparkles className="h-5 w-5 text-[#635BDB]/70" strokeWidth={1.75} />
      </div>

      {/* Heading */}
      <h3 className="mt-5 max-w-[220px] font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.01em] text-[#1A1613] sm:text-[28px]">
        Talk with AI partners.
      </h3>

      {/* Body */}
      <p className="mt-4 max-w-[260px] text-[14px] leading-relaxed text-[#6B6B78]">
        Practice with AI teachers that adapt to your level. Get real
        conversations, feedback, and steady progress.
      </p>

      {/* Floating pills + learner image */}
      <div className="relative mt-8 flex-1">
        {/* Left floating pills */}
        <div className="relative z-10 flex flex-col gap-2.5">
          <div className="inline-flex max-w-[190px] items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
            <Headphones
              className="h-4 w-4 shrink-0 text-[#635BDB]"
              strokeWidth={2}
            />
            <span className="text-[12px] font-medium text-[#24232B]">
              That&apos;s a great way to say it!
            </span>
          </div>

          <div className="inline-flex max-w-[190px] items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
            <Headphones
              className="h-4 w-4 shrink-0 text-[#635BDB]"
              strokeWidth={2}
            />
            <span className="text-[12px] font-medium text-[#24232B]">
              Let&apos;s try a new scenario.
            </span>
          </div>
        </div>

        {/* Transparent learner image — anchored bottom-right */}
        <div className="pointer-events-none absolute -bottom-8 -right-4 z-0 h-[260px] w-[260px] sm:h-[280px] sm:w-[280px]">
          <Image
            src="/images/marketing/card_three.webp"
            alt="AI learner with headphones"
            fill
            sizes="280px"
            className="object-contain object-bottom"
            priority={false}
          />
        </div>
      </div>

      {/* Bottom link */}
      <div className="relative z-10 mt-auto pt-8">
        <Link
          href="/app/ai-calls"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#635BDB] transition-opacity hover:opacity-80"
        >
          Try AI learning
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </Link>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Features row — exported                                                    */
/* -------------------------------------------------------------------------- */
/**
 * Three-card feature row for the public landing page.
 *
 * - Parent Container already provides horizontal padding — DO NOT add any.
 * - Images sourced from /public/images/marketing/
 * - Animations: Framer Motion, staggered fade-up, respects reduced motion.
 */
export function FeaturesRow() {
  return (
    <section aria-label="Three ways to speak" className="pb-16 sm:pb-20 lg:pb-24">
      <motion.div
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 gap-5 md:grid-cols-3"
      >
        <CardOneToOne />
        <CardRooms />
        <CardAI />
      </motion.div>
    </section>
  );
}