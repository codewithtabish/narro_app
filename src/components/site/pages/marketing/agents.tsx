// src/components/public/agents-section.tsx
"use client";

import { SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Image from "next/image";

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

const bulletItem = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const BULLETS = [
  "Realistic voice conversations",
  "Personalized to your goals",
  "Always available, 24/7",
] as const;

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * AI Agents — public marketing feature section.
 *
 * Layout:
 *   - Desktop: 12-col grid, copy on left (6), image on right (6).
 *   - Mobile: image first (order-1), copy second (order-2).
 *
 * Theming:
 *   - Semantic tokens only (foreground, muted-foreground, primary, background).
 *   - Ships two image variants (light / dark) and crossfades on theme switch.
 *   - Dark variant uses a radial mask to hide the baked-in rectangular edge.
 *
 * Motion:
 *   - Framer Motion staggered fade-up. Respects `prefers-reduced-motion`
 *     automatically via the CSS-based keyframes; the JS animations are
 *     intentionally short and subtle.
 *
 * Rules:
 *   - No horizontal padding — parent <Container> handles it.
 *   - All CTAs open the Clerk modal (signup + signin force → /app).
 */
export function AgentsSection() {
  return (
    <section
      data-slot="marketing-agents"
      aria-labelledby="agents-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        {/* ================================================================ */}
        {/* LEFT — copy                                                       */}
        {/* ================================================================ */}
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="order-2 flex flex-col items-start lg:order-1 lg:col-span-6 xl:col-span-6"
        >
          {/* Eyebrow pill */}
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-[11px]"
          >
            <Sparkles
              className="h-3 w-3"
              strokeWidth={2.25}
              aria-hidden="true"
            />
            AI Agents
          </motion.span>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            id="agents-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.12] tracking-[-0.02em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            Practice with AI teachers,
            <br className="hidden sm:block" />{" "}
            <span className="italic text-primary">anytime</span> you want.
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-[16px] lg:text-[16.5px] lg:leading-[1.7]"
          >
            Choose from our library of AI conversation partners, each with a
            unique personality, accent, and teaching style — tuned to how you
            learn best.
          </motion.p>

          {/* Bullets */}
          <motion.ul
            variants={staggerParent}
            className="mt-7 flex flex-col gap-3 sm:mt-8"
          >
            {BULLETS.map((item) => (
              <motion.li
                key={item}
                variants={bulletItem}
                className="flex items-start gap-3"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10"
                >
                  <Check
                    className="h-3 w-3 text-primary"
                    strokeWidth={2.75}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-[14px] font-medium text-foreground sm:text-[15px]">
                  {item}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA — opens Clerk modal */}
          <motion.div variants={fadeUp} className="mt-8 sm:mt-9">
            <SignUpButton
              mode="modal"
              forceRedirectUrl="/app"
              signInForceRedirectUrl="/app"
            >
              <button
                type="button"
                className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-[15px]"
              >
                Explore AI agents
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </button>
            </SignUpButton>
          </motion.div>
        </motion.div>

        {/* ================================================================ */}
        {/* RIGHT — agent carousel image (light + dark swap)                  */}
        {/* ================================================================ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6"
        >
          <div className="relative mx-auto w-full max-w-[520px] sm:max-w-[580px] lg:max-w-none">
            {/* Ambient brand glow behind the image */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 scale-[0.85] rounded-[40px] bg-primary/10 blur-3xl"
            />

            {/* Light mode */}
            <Image
              src="/images/landing/light-agents.png"
              alt="NARRO AI teachers carousel showing Maya and other conversation partners"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              priority={false}
              className="h-auto w-full select-none rounded-none object-contain shadow-none ring-0 outline-none dark:hidden"
            />

            {/* Dark mode — radial mask hides the baked-in rectangular edge */}
            <Image
              src="/images/landing/dark-agents.png"
              alt="NARRO AI teachers carousel showing Maya and other conversation partners"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              priority={false}
              className={[
                "hidden h-auto w-full select-none rounded-none object-contain",
                "shadow-none ring-0 outline-none",
                "dark:block",
                "dark:mask-[radial-gradient(ellipse_58%_58%_at_center,black_58%,transparent_88%)]",
                "dark:[-webkit-mask-image:radial-gradient(ellipse_58%_58%_at_center,black_58%,transparent_88%)]",
              ].join(" ")}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}