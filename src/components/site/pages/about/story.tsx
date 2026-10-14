import Image from "next/image";

/* -------------------------------------------------------------------------- */
/*  Story — Section                                                            */
/* -------------------------------------------------------------------------- */

export function StorySection() {
  return (
    <section
      id="story"
      data-slot="about-story"
      aria-labelledby="story-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT — editorial photograph                                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-1 lg:col-span-6 xl:col-span-6">
          <div className="relative mx-auto w-full max-w-[520px] sm:max-w-[580px] lg:max-w-none">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-muted">
              <Image
                src="/images/about/story.webp"
                alt="A learner practicing a new language on a laptop with headphones, speaking naturally"
                fill
                priority
                quality={85}
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="scale-[1.01] object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT — copy                                                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-2 flex flex-col items-start lg:col-span-6 xl:col-span-6">
          {/* Eyebrow */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            Our story
          </span>

          {/* Heading */}
          <h2
            id="story-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            We started NARRO because we were tired of being afraid to speak.
          </h2>

          {/* Paragraph 1 */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            We grew up studying languages. Years of classes, flashcards, and
            grammar drills. But the moment we tried to actually speak with
            someone, we froze.
          </p>

          {/* Paragraph 2 */}
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            NARRO was built to fix that. Not another lesson app — a place
            where you can practice speaking safely, first with AI, then with
            real people, until the fear turns into fluency.
          </p>
        </div>
      </div>
    </section>
  );
}