import { Star } from "lucide-react";
import Image from "next/image";

/* -------------------------------------------------------------------------- */
/*  Testimonials — Section                                                     */
/* -------------------------------------------------------------------------- */

type Testimonial = {
  quote: string;
  name: string;
  location: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "NARRO has completely changed my confidence. I can actually hold conversations now!",
    name: "Aima Khan",
    location: "Karachi, Pakistan",
    avatar: "https://i.pravatar.cc/200?img=47",
  },
  {
    quote:
      "The AI conversations feel so natural. It's like having a patient friend who's always there.",
    name: "Ali Khan",
    location: "Lahore, Pakistan",
    avatar: "https://i.pravatar.cc/200?img=12",
  },
  {
    quote:
      "I love the real people calls. It's the best way to learn and make new friends around the world.",
    name: "Ayesha Khan",
    location: "Islamabad, Pakistan",
    avatar: "https://i.pravatar.cc/200?img=32",
  },
];

export function TestimonialsSection() {
  return (
    <section
      data-slot="marketing-testimonials"
      aria-labelledby="testimonials-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
          Loved by learners
        </span>

        <h2
          id="testimonials-heading"
          className="mt-5 max-w-2xl font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
        >
          Real people. Real progress.
        </h2>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CARDS — no card chrome, editorial layout                            */}
      {/* ------------------------------------------------------------------ */}
      <ul className="mt-12 grid grid-cols-1 gap-10 sm:mt-14 sm:grid-cols-2 sm:gap-12 lg:mt-16 lg:grid-cols-3 lg:gap-14">
        {TESTIMONIALS.map((t) => (
          <li key={t.name} className="flex flex-col">
            {/* Stars */}
            <div
              className="flex items-center gap-0.5"
              aria-label="Rated 5 out of 5 stars"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-primary text-primary"
                  strokeWidth={0}
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Quote */}
            <p className="mt-5 flex-1 text-base leading-relaxed text-foreground sm:text-[1.05rem] sm:leading-[1.7]">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="mt-7 flex items-center gap-3">
              <Image
                src={t.avatar}
                alt={t.name}
                width={44}
                height={44}
                sizes="44px"
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">
                  {t.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {t.location}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}