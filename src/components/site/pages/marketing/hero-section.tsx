"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Star } from "lucide-react";
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
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

const fadeUpShort: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

const imageEnter: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.96 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_OUT, delay: 0.15 },
  },
};

const starPop: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  const parent: Variants = reduceMotion
    ? { hidden: {}, show: { transition: { staggerChildren: 0 } } }
    : staggerParent;

  const item: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : fadeUp;

  const itemShort: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : fadeUpShort;

  const imageVariant: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : imageEnter;

  return (
    <section
      data-slot="marketing-hero"
      aria-labelledby="hero-heading"
      className="relative w-full pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 xl:pt-24 xl:pb-28 2xl:pt-28 2xl:pb-32"
    >
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10 xl:gap-14 2xl:gap-16">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT — copy (6/12)                                                  */}
        {/* ------------------------------------------------------------------ */}
        <motion.div
          variants={parent}
          initial="hidden"
          animate="show"
          className="flex w-full flex-col items-start lg:col-span-6 xl:col-span-6"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary sm:text-[11px]"
          >
            Speaking-first language learning
          </motion.span>

          <motion.h1
            id="hero-heading"
            variants={item}
            className="mt-7 w-full text-left font-serif text-[2.25rem] font-normal leading-[1.08] tracking-[-0.022em] text-balance text-foreground sm:mt-8 sm:text-[2.75rem] sm:leading-[1.06] lg:text-[3.25rem] xl:text-[3.75rem] 2xl:text-[4.25rem]"
          >
            Learn a language by{" "}
            <em className="italic text-foreground">actually speaking it.</em>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 w-full max-w-2xl text-left text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg lg:text-[1.15rem] lg:leading-[1.7]"
          >
            Speak more. Fear less. Become fluent through real conversations
            with AI and real people — anytime, anywhere.
          </motion.p>

          <motion.div
            variants={itemShort}
            className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4"
          >
            <a
              href="#"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-primary px-7 text-[0.9rem] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <AppleLogo className="h-4 w-4" />
              Download for iOS
            </a>
            <a
              href="#"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-secondary px-7 text-[0.9rem] font-semibold text-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <GooglePlayLogo className="h-4 w-4" />
              Get it on Android
            </a>
          </motion.div>

          <motion.div
            variants={itemShort}
            className="mt-8 flex w-full flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:mt-9"
          >
            <motion.div
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.06, delayChildren: 0.1 },
                },
              }}
              className="flex items-center gap-0.5"
              aria-label="Rated 4.9 out of 5 stars"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.span key={i} variants={starPop}>
                  <Star
                    className="h-4 w-4 fill-primary text-primary"
                    strokeWidth={0}
                    aria-hidden="true"
                  />
                </motion.span>
              ))}
            </motion.div>
            <span className="font-semibold text-foreground">4.9</span>
            <span className="text-muted-foreground">· 12,000+ learners</span>
            <span className="hidden text-muted-foreground md:inline">
              · Available in 40+ countries
            </span>
          </motion.div>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT — hero image (6/12) with entrance + gentle float              */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-6 xl:col-span-6">
          <motion.div
            variants={imageVariant}
            initial="hidden"
            animate="show"
            className="relative mx-auto w-full max-w-[560px] sm:max-w-[640px] lg:max-w-none"
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 6,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "loop",
                    }
              }
            >
              <Image
                src="/images/hero.png"
                alt="NARRO mobile app showing the AI practice conversation screen"
                width={1600}
                height={1200}
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                draggable={false}
                className={[
                  "h-auto w-full select-none object-contain",
                  "rounded-none shadow-none ring-0 outline-none",
                  "dark:mask-[radial-gradient(ellipse_62%_62%_at_center,black_58%,transparent_90%)]",
                  "dark:[-webkit-mask-image:radial-gradient(ellipse_62%_62%_at_center,black_58%,transparent_90%)]",
                  "dark:brightness-95",
                ].join(" ")}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}