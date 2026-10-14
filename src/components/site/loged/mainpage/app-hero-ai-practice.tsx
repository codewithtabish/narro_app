import { Clock, Mic, Sparkles } from "lucide-react";
import Image from "next/image";

import { StartSpeakingButton } from "@/components/site/loged/mainpage/start-speaking-button";

/* -------------------------------------------------------------------------- */
/*  AI Practice — Hero Section                                                 */
/* -------------------------------------------------------------------------- */

interface AppHeroAIPracticeProps {
  /** Free speaking seconds remaining this week. Falls back to 8 minutes. */
  freeSecondsRemaining?: number;
}

export function AppHeroAIPractice({
  freeSecondsRemaining = 8 * 60,
}: AppHeroAIPracticeProps) {
  const minutesRemaining = Math.max(
    0,
    Math.floor(freeSecondsRemaining / 60),
  );

  return (
    <section
      data-slot="app-hero-ai-practice"
      aria-labelledby="app-hero-heading"
      className="relative w-full "
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* ================================================================= */}
        {/* LEFT — copy (7/12 on lg)                                          */}
        {/* ================================================================= */}
        <div className="order-2 flex flex-col items-start lg:order-1 lg:col-span-7">
          {/* Eyebrow */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            AI Practice
          </span>

          {/* Heading */}
          <h2
            id="app-hero-heading"
            className="mt-3 max-w-2xl font-serif text-[1.5rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:text-[1.75rem] lg:text-[2.25rem]"
          >
            Your personal speaking partner
          </h2>

          {/* Description — capped line length for readability */}
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Practice real conversations, build confidence, and speak
            naturally — anytime, anywhere.
          </p>

          {/* Meta chips */}
          <ul className="mt-4 flex flex-wrap items-center gap-2">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
              <Mic
                className="h-3.5 w-3.5 text-primary"
                strokeWidth={2.25}
                aria-hidden="true"
              />
              Real-time voice
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
              <Sparkles
                className="h-3.5 w-3.5 text-primary"
                strokeWidth={2.25}
                aria-hidden="true"
              />
              Adapts to your level
            </li>
          </ul>

          {/* CTA + remaining minutes */}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <StartSpeakingButton />

            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock
                className="h-3.5 w-3.5"
                strokeWidth={2}
                aria-hidden="true"
              />
              ~{minutesRemaining} min free remaining this week
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT — voice orb (5/12 on lg)                                    */}
        {/* ================================================================= */}
        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="relative mx-auto w-full max-w-xs sm:max-w-[380px] lg:max-w-[420px]">
            {/* Light mode */}
            <Image
              src="/images/loged/light-step-3.png"
              alt="NARRO AI voice orb showing Listening, Thinking and Speaking states"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 70vw, 40vw"
              draggable={false}
              className="h-auto w-full select-none rounded-none object-contain shadow-none ring-0 outline-none dark:hidden"
            />

            {/* Dark mode — radial mask fades any baked-in rectangular edge */}
            <Image
              src="/images/loged/dark-step-3.png"
              alt="NARRO AI voice orb showing Listening, Thinking and Speaking states"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 70vw, 40vw"
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