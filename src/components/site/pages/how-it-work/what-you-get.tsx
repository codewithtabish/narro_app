import { Bot, Phone, Users } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  What You Get — Section                                                     */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    Icon: Bot,
    title: "AI Practice",
    description: "Unlimited conversations with AI",
  },
  {
    Icon: Phone,
    title: "Human Calls",
    description: "1-to-1 with real language partners",
  },
  {
    Icon: Users,
    title: "Speaking Rooms",
    description: "Live group conversations",
  },
] as const;

export function WhatYouGetSection() {
  return (
    <section
      id="what-you-get"
      data-slot="how-it-works-what-you-get"
      aria-labelledby="what-you-get-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      {/* ------------------------------------------------------------------ */}
      {/* PEACH BAND                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="w-full overflow-hidden rounded-3xl bg-primary/5 px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        {/* Header */}
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            What you get
          </span>

          <h2
            id="what-you-get-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            Everything you need to speak with confidence.
          </h2>
        </div>

        {/* Features — borderless editorial grid */}
        <ul className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-10 sm:mt-14 sm:grid-cols-2 sm:gap-12 lg:mt-16 lg:grid-cols-3 lg:gap-14">
          {FEATURES.map(({ Icon, title, description }) => (
            <li
              key={title}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              {/* Icon badge */}
              <span
                aria-hidden="true"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>

              {/* Title */}
              <h3 className="mt-5 text-base font-semibold text-foreground sm:text-[1.1rem]">
                {title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}