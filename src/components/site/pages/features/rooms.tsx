"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Speaking Rooms — Feature Section                                           */
/* -------------------------------------------------------------------------- */

const BULLETS = [
  "Topic-based rooms for every interest",
  "Join with one tap",
  "Meet people worldwide",
  "Build lasting connections",
] as const;

export function FeatureRooms() {
  const { isSignedIn } = useUser();

  return (
    <section
      id="rooms"
      data-slot="features-rooms"
      aria-labelledby="features-rooms-heading"
      className="relative w-full pb-16 sm:pb-20 lg:pb-24 xl:pb-28"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT — rooms image                                                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-1 lg:col-span-6 xl:col-span-6">
          <div className="relative mx-auto w-full max-w-[520px] sm:max-w-[580px] lg:max-w-none">
            <Image
              src="/images/features/rooms.webp"
              alt="NARRO live speaking rooms showing Global English Chat and Travel & Culture with participant avatars"
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

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT — copy                                                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="order-2 flex flex-col items-start lg:col-span-6 xl:col-span-6">
          {/* Eyebrow */}
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            Speaking Rooms
          </span>

          {/* Heading */}
          <h2
            id="features-rooms-heading"
            className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.15] tracking-[-0.015em] text-balance text-foreground sm:mt-6 sm:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem]"
          >
            Join live rooms. Speak with the world.
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:text-[1.05rem] lg:leading-[1.7]">
            Jump into themed group rooms, meet new people, practice real
            conversations, and be part of a global community of learners.
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

          {/* Explore link — signed out → Clerk modal, signed in → feature page */}
          {isSignedIn ? (
            <Link
              href="/features/rooms"
              className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary shadow-none ring-0 transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-9 sm:text-[0.95rem]"
            >
              Explore speaking rooms
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          ) : (
            <SignUpButton
              mode="modal"
              forceRedirectUrl="/app"
              signInForceRedirectUrl="/app"
            >
              <button
                type="button"
                className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary shadow-none ring-0 transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-9 sm:text-[0.95rem]"
              >
                Explore speaking rooms
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </SignUpButton>
          )}
        </div>
      </div>
    </section>
  );
}