import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Step 03 — Start speaking deep dive                                         */
/* -------------------------------------------------------------------------- */

const BULLETS = [
  "Practice 1-to-1 with AI, anytime",
  "Join live rooms with real learners",
  "Book one-to-one calls with partners",
] as const;

export function Step3Section() {
  return (
    <section
      id="step-3"
      data-slot="how-it-works-step-3"
      aria-labelledby="step-3-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT — image (light + dark swap)                                    */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-1 lg:col-span-6 xl:col-span-6">
          <div className="relative mx-auto w-full max-w-[520px] sm:max-w-[580px] lg:max-w-none">
            {/* Light mode */}
            <Image
              src="/images/how-it-works/light-step-3.png"
              alt="NARRO AI voice orb showing Listening, Thinking and Speaking states"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              className="h-auto w-full select-none rounded-none object-contain shadow-none ring-0 outline-none dark:hidden"
            />

            {/* Dark mode — radial mask fades any baked-in rectangular edge */}
            <Image
              src="/images/how-it-works/dark-setp-3.png"
              alt="NARRO AI voice orb showing Listening, Thinking and Speaking states"
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

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT — copy                                                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-2 flex flex-col items-start lg:col-span-6 xl:col-span-6">
          {/* Step badge */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            Step 03
          </span>

          {/* Heading */}
          <h2
            id="step-3-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            Start speaking — with AI or humans.
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            Practice with our AI anytime, join live rooms with real learners,
            or book one-to-one calls with language partners.
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

          {/* See all features link */}
          <Link
            href="/features"
            className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary shadow-none ring-0 transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-9 sm:text-[0.95rem]"
          >
            See all features
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}