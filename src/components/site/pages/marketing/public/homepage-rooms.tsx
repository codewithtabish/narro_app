import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */
const MOCK_ROOMS = [
  {
    id: "room-1",
    title: "Casual Conversations",
    language: "English",
    members: 124,
    avatars: [
      "/images/marketing/avatar1.webp",
      "/images/marketing/avatar2.webp",
      "/images/marketing/avatar3.webp",
      "/images/marketing/avatar4.webp",
    ],
  },
  {
    id: "room-2",
    title: "Culture & Travel",
    language: "Spanish",
    members: 98,
    avatars: [
      "/images/marketing/community-1.webp",
      "/images/marketing/community-2.webp",
      "/images/marketing/community-3.webp",
      "/images/marketing/community-4.webp",
    ],
  },
  {
    id: "room-3",
    title: "Daily Life & Tips",
    language: "French",
    members: 76,
    avatars: [
      "/images/marketing/testimonial-1.webp",
      "/images/marketing/testimonial-2.webp",
      "/images/marketing/testimonial-3.webp",
      "/images/marketing/avatar1.webp",
    ],
  },
  {
    id: "room-4",
    title: "Language Practice",
    language: "German",
    members: 62,
    avatars: [
      "/images/marketing/avatar2.webp",
      "/images/marketing/avatar3.webp",
      "/images/marketing/avatar4.webp",
      "/images/marketing/community-1.webp",
    ],
  },
  {
    id: "room-5",
    title: "Anime & Pop Culture",
    language: "Japanese",
    members: 110,
    avatars: [
      "/images/marketing/community-2.webp",
      "/images/marketing/community-3.webp",
      "/images/marketing/community-4.webp",
      "/images/marketing/testimonial-1.webp",
    ],
  },
  {
    id: "room-6",
    title: "Food & Lifestyle",
    language: "Italian",
    members: 88,
    avatars: [
      "/images/marketing/testimonial-2.webp",
      "/images/marketing/testimonial-3.webp",
      "/images/marketing/avatar1.webp",
      "/images/marketing/avatar2.webp",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Skeleton Loader                                                           */
/* -------------------------------------------------------------------------- */
export function HomepageRoomsSkeleton() {
  return (
    <section className="pb-12 sm:pb-16 lg:pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[200px] animate-pulse flex-col justify-between rounded-[24px] border border-border/60 bg-card p-6"
          >
            <div>
              <div className="flex justify-between">
                <div className="h-5 w-12 rounded-full bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
              <div className="mt-4 h-6 w-3/4 rounded bg-muted" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-10 w-10 rounded-full bg-muted" />
                </div>
                <div className="h-4 w-20 rounded bg-muted" />
              </div>
              <div className="mt-5 h-10 w-full rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Exported Section                                                      */
/* -------------------------------------------------------------------------- */
export function HomepageRooms() {
  return (
    <section className="pb-12 sm:pb-16 lg:pb-20">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="font-serif text-[32px] font-normal tracking-[-0.02em] text-foreground">
          Live rooms right now.
        </h2>
        <p className="text-[15px] text-muted-foreground">
          Drop in, say hi, and start speaking with real people.
        </p>
      </div>

      {/* Grid with Suspense */}
      <Suspense fallback={<HomepageRoomsSkeleton />}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_ROOMS.map((room) => (
            <div
              key={room.id}
              className={cn(
                "group flex flex-col justify-between rounded-[24px] border border-border/60 bg-card p-6",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_40px_-20px_rgba(107,74,58,0.3)]"
              )}
            >
              {/* Top Section */}
              <div>
                <div className="flex items-center justify-between">
                  {/* Live Badge */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                  
                  {/* Language */}
                  <span className="text-[12px] font-medium text-muted-foreground">
                    {room.language}
                  </span>
                </div>

                {/* Room Title */}
                <h3 className="mt-4 text-[18px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {room.title}
                </h3>
              </div>

              {/* Bottom Section */}
              <div className="mt-8">
                {/* Avatars & Members (Larger & More Unique) */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {room.avatars.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative h-10 w-10 overflow-hidden rounded-full border-[3px] border-card bg-muted shadow-sm transition-transform duration-300 group-hover:scale-105"
                      >
                        <Image
                          src={src}
                          alt="Member"
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {/* Extra Count Badge */}
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-card bg-primary/10 text-[11px] font-bold text-primary shadow-sm transition-transform duration-300 group-hover:scale-105">
                      +{room.members - 4}
                    </div>
                  </div>
                  <span className="text-[13px] font-medium text-muted-foreground">
                    {room.members} members
                  </span>
                </div>

                {/* Join Button */}
                <SignUpButton
                  mode="modal"
                  forceRedirectUrl={`/app/rooms/${room.id}`}
                  signInForceRedirectUrl={`/app/rooms/${room.id}`}
                >
                  <button className="flex h-10 w-full items-center justify-center rounded-full bg-primary text-[14px] font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]">
                    Join room
                  </button>
                </SignUpButton>
              </div>
            </div>
          ))}
        </div>
      </Suspense>

      {/* Browse All Link */}
      <div className="mt-10 flex justify-start">
        <a
          href="/rooms"
          className="group inline-flex items-center gap-2 text-[15px] font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Browse all rooms
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}