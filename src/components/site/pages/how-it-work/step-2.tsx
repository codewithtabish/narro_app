import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Step 02 — Pick a language deep dive                                        */
/* -------------------------------------------------------------------------- */

const BULLETS = [
  "40+ languages to choose from",
  "Set your level: beginner to advanced",
  "Choose topics that match your goals",
] as const;

export function Step2Section() {
  return (
    <section
      id="step-2"
      data-slot="how-it-works-step-2"
      aria-labelledby="step-2-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT — copy                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-2 flex flex-col items-start lg:order-1 lg:col-span-6 xl:col-span-6">
          {/* Step badge */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            Step 02
          </span>

          {/* Heading */}
          <h2
            id="step-2-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            Pick a language and topic.
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            Choose from 40+ languages and set your level. Then pick topics
            that match your goals — travel, work, study or just for fun.
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

          {/* Continue link — scrolls to next step */}
          <Link
            href="#step-3"
            className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary shadow-none ring-0 transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-9 sm:text-[0.95rem]"
          >
            Continue to step 3
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT — image (light + dark swap)                                   */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6">
          <div className="relative mx-auto w-full max-w-[520px] sm:max-w-[580px] lg:max-w-none">
            {/* Light mode */}
            <Image
              src="/images/how-it-works/light-step-2.png"
              alt="NARRO language picker showing English, Spanish, French, German, and Japanese"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              className="h-auto w-full select-none rounded-none object-contain shadow-none ring-0 outline-none dark:hidden"
            />

            {/* Dark mode — radial mask fades any baked-in rectangular edge */}
            <Image
              src="/images/how-it-works/dark-step-2.png"
              alt="NARRO language picker showing English, Spanish, French, German, and Japanese"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              className={[
                "hidden h-auto w-full select-none rounded-none object-contain",
                "shadow-none ring-0 outline-none",
                "dark:block",
                "dark:mask-[radial-gradient(ellipse_58%_58%_at_center,black_58%,transparent_88%)]",
                "dark:mask-[radial-gradient(ellipse_58%_58%_at_center,black_58%,transparent_88%)]",
              ].join(" ")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}