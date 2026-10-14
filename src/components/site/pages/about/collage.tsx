import Image from "next/image";

/* -------------------------------------------------------------------------- */
/*  Collage — Section                                                          */
/* -------------------------------------------------------------------------- */

export function CollageSection() {
  return (
    <section
      id="collage"
      data-slot="about-collage"
      aria-labelledby="collage-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT — copy                                                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-2 flex flex-col items-start lg:order-1 lg:col-span-6 xl:col-span-6">
          {/* Eyebrow */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            Our community
          </span>

          {/* Heading */}
          <h2
            id="collage-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            Real people. Real conversations. Real progress.
          </h2>

          {/* Paragraph 1 */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            Every day, thousands of learners open NARRO to practice speaking —
            with AI, with language partners, and in live rooms with people from
            all over the world.
          </p>

          {/* Paragraph 2 */}
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            No scripts. No pressure. Just warm, natural conversations that turn
            a shy learner into a confident speaker — one voice at a time.
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT — collage image                                              */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6">
          <div className="relative mx-auto w-full max-w-[520px] sm:max-w-[580px] lg:max-w-none">
            <Image
              src="/images/about/collage.webp"
              alt="Collage of NARRO learners practicing languages on their laptops with headphones"
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 45vw"
              draggable={false}
              className={[
                "h-auto w-full select-none rounded-none object-contain",
                "shadow-none ring-0 outline-none",
                // Dark-mode: radial mask fades any baked-in rectangular edge
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