
/* -------------------------------------------------------------------------- */
/*  About — Hero + Mission                                                     */
/* -------------------------------------------------------------------------- */

export function AboutHero() {
  return (
    <section
      data-slot="about-hero"
      aria-labelledby="about-hero-heading"
      className="relative w-full pt-14  pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 xl:pt-24 xl:pb-28"
    >
      {/* ================================================================== */}
      {/* TOP — HERO (centered)                                              */}
      {/* ================================================================== */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        {/* Eyebrow pill */}
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
          About Narro
        </span>

        {/* Heading */}
        <h1
          id="about-hero-heading"
          className="mt-6 font-serif text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-balance text-foreground sm:mt-7 sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem]"
        >
          Built for people who want
          <br className="hidden sm:block" />{" "}
          to speak, not just study.
        </h1>

        {/* Subhead */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg lg:text-[1.1rem] lg:leading-[1.7]">
          NARRO exists because speaking a new language shouldn&apos;t feel
          scary. We make it effortless to start real conversations — with AI
          and with people — so you can build confidence one voice at a time.
        </p>
      </div>

      {/* ================================================================== */}
      {/* BOTTOM — MISSION (peach band)                                      */}
      {/* ================================================================== */}
      <div className="mt-16 w-full rounded-3xl bg-primary/5 px-6 py-14 sm:mt-20 sm:px-10 sm:py-16 lg:mt-24 lg:px-14 lg:py-20 xl:px-16 xl:py-24">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {/* Eyebrow pill */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            Our mission
          </span>

          {/* Heading */}
          <h2
            id="about-mission-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            Make speaking a new language
            <br className="hidden sm:block" />{" "}
            a natural part of everyday life.
          </h2>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            Traditional language apps reward memorization. We reward speaking.
            Every feature in NARRO is designed around one idea: the fastest
            way to fluency is to open your mouth and talk.
          </p>
        </div>
      </div>
    </section>
  );
}