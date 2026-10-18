// src/components/public/testimonials-section.tsx
"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
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
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const TESTIMONIALS = [
  {
    quote:
      "NARRO makes speaking feel natural. I actually look forward to my calls!",
    name: "Sarah L.",
    meta: "United States · English",
    avatar: "/images/marketing/testimonial-1.webp",
    rating: 5,
  },
  {
    quote:
      "The group rooms are amazing. I’ve met people from 5 different countries!",
    name: "Daniel K.",
    meta: "Canada · Spanish",
    avatar: "/images/marketing/testimonial-2.webp",
    rating: 5,
  },
  {
    quote:
      "The AI teacher is so helpful. I get instant feedback and feel myself improving.",
    name: "Priya S.",
    meta: "India · French",
    avatar: "/images/marketing/testimonial-3.webp",
    rating: 5,
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * "What our community says" testimonials section.
 *
 * Layout:
 *   - Left column: eyebrow pill + big serif heading + subcopy.
 *   - Right column: three testimonial cards in a responsive grid.
 *
 * Theming:
 *   - Semantic tokens only (foreground, muted-foreground, card, border,
 *     primary, accent) so light and dark mode both work via shadcn
 *     CSS variables.
 *
 * Rules:
 *   - No horizontal padding here — parent <Container> handles it.
 *   - Uses Next.js <Image> with the marketing .webp assets.
 *   - Framer Motion staggered fade-in.
 */
export function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="pb-20 sm:pb-24 lg:pb-28"
    >
      {/* Soft cream panel matching the mockup — theme-safe */}
      <div
        className={cn(
          "rounded-[28px] bg-muted/50",
          "p-6 sm:p-10 lg:p-14",
          "border border-border/60",
        )}
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:items-start lg:gap-14">
          {/* ============================================================== */}
          {/* LEFT — heading + subcopy                                        */}
          {/* ============================================================== */}
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col lg:sticky lg:top-24"
          >
            {/* Eyebrow pill */}
            <motion.span
              variants={fadeUp}
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full",
                "bg-primary/10 px-3.5 py-1.5",
                "text-[10px] font-bold uppercase tracking-[0.16em]",
                "text-primary",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Loved by Learners
            </motion.span>

            {/* Heading */}
            <motion.h2
              variants={fadeUp}
              id="testimonials-heading"
              className={cn(
                "mt-5 font-serif text-[34px] font-normal leading-[1.05]",
                "tracking-[-0.02em] text-foreground",
                "sm:text-[42px] lg:text-[48px]",
              )}
            >
              What our
              <br />
              community
              <br />
              <span className="italic text-primary">says.</span>
            </motion.h2>

            {/* Subcopy */}
            <motion.p
              variants={fadeUp}
              className={cn(
                "mt-5 max-w-xs text-[14.5px] leading-relaxed",
                "text-muted-foreground",
              )}
            >
              Real learners. Real progress. Here’s what people building
              fluency with NARRO have to say.
            </motion.p>
          </motion.div>

          {/* ============================================================== */}
          {/* RIGHT — testimonial cards                                       */}
          {/* ============================================================== */}
          <motion.ul
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className={cn(
              "grid grid-cols-1 gap-5",
              "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {TESTIMONIALS.map((t) => (
              <motion.li
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "group relative flex flex-col",
                  "rounded-3xl border border-border bg-card",
                  "p-6 sm:p-7",
                  "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-16px_rgba(0,0,0,0.08)]",
                  "transition-shadow duration-300",
                  "hover:shadow-[0_24px_60px_-32px_rgba(107,74,58,0.35)]",
                  "hover:border-primary/20",
                )}
              >
                {/* Decorative quote glyph */}
                <Quote
                  className={cn(
                    "absolute right-5 top-5 h-6 w-6 -scale-x-100",
                    "text-primary/15 transition-colors duration-300",
                    "group-hover:text-primary/30",
                  )}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />

                {/* Stars */}
                <div
                  className="flex items-center gap-0.5"
                  aria-label={`Rated ${t.rating} out of 5`}
                >
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-primary text-primary"
                      strokeWidth={0}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote
                  className={cn(
                    "mt-4 flex-1 text-[14px] leading-[1.65]",
                    "text-foreground/90",
                  )}
                >
                  {t.quote}
                </blockquote>

                {/* Divider */}
                <div
                  aria-hidden="true"
                  className="mt-6 h-px w-full bg-border"
                />

                {/* Author row */}
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className={cn(
                      "relative h-10 w-10 shrink-0 overflow-hidden rounded-full",
                      "ring-2 ring-background",
                      "outline outline-border",
                    )}
                  >
                    <Image
                      src={t.avatar}
                      alt={`${t.name} avatar`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[13.5px] font-semibold text-foreground">
                      {t.name}
                    </span>
                    <span className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {t.meta}
                    </span>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}