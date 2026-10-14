
/* -------------------------------------------------------------------------- */
/*  How It Works — Section                                                     */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    number: "1",
    title: "Sign up in 10 seconds",
    description:
      "Create your free account and get started right away.",
  },
  {
    number: "2",
    title: "Pick a language and topic",
    description:
      "Tell us what you want to learn and what you're interested in.",
  },
  {
    number: "3",
    title: "Start speaking — with AI or humans",
    description:
      "Have real conversations and track your progress.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      data-slot="marketing-how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative w-full overflow-hidden rounded-3xl bg-primary/5 pb-14 pt-14 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20 xl:pb-24 xl:pt-24"
    >
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
          How it works
        </span>

        <h2
          id="how-it-works-heading"
          className="mt-5 max-w-2xl font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
        >
          Start speaking in 3 simple steps.
        </h2>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* STEPS                                                               */}
      {/* ------------------------------------------------------------------ */}
      <ol
        className={[
          "mt-12 grid grid-cols-1 gap-10 sm:mt-14 lg:mt-16",
          "lg:grid-cols-3 lg:gap-6 xl:gap-10",
        ].join(" ")}
      >
        {STEPS.map((step, index) => (
          <li
            key={step.number}
            className={[
              "relative flex flex-col items-center text-center",
              // Vertical divider between columns on lg+
              index !== STEPS.length - 1
                ? "lg:border-r lg:border-border/60 lg:pr-6 xl:pr-10"
                : "",
            ].join(" ")}
          >
            {/* Numbered badge */}
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm"
            >
              {step.number}
            </span>

            {/* Title */}
            <h3 className="mt-5 text-base font-semibold text-foreground sm:text-[1.05rem]">
              {step.title}
            </h3>

            {/* Description */}
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}