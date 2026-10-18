import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Phone } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

import {
    getHomepageCommunityUsers,
    type HomepageUser
} from "@/app/actions/user/get-homepage-community-users";
import { getInterestEmoji, getInterestLabel } from "@/data/interests";
import { getLanguageName } from "@/data/languages";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatSpeaks(user: HomepageUser, max: number) {
  return (
    user.languagesSpoken
      .slice(0, max)
      .map((code) => getLanguageName(code))
      .join(", ") || "—"
  );
}

function formatLearning(user: HomepageUser, max: number) {
  return (
    user.languagesLearning
      .slice(0, max)
      .map((code) => {
        const level = user.proficiencyByLanguage?.[code];
        const name = getLanguageName(code);
        return level ? `${name} (${level.charAt(0)})` : name;
      })
      .join(", ") || "—"
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton Loader (For Suspense Fallback)                                    */
/* -------------------------------------------------------------------------- */
export function HomepageCommunitySkeleton() {
  return (
    <section className="pb-10 sm:pb-12 lg:pb-14">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col animate-pulse overflow-hidden rounded-3xl border border-border bg-card"
          >
            <div className="aspect-4/3 w-full bg-muted" />
            <div className="flex flex-col gap-3 p-5">
              <div className="h-5 w-1/2 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="mt-4 h-10 w-full rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  The Main User Card (Perfect Vertical Layout)                               */
/* -------------------------------------------------------------------------- */
function UserCard({ user }: { user: HomepageUser }) {
  const avatarUrl = user.profileImageUrl ?? user.imageUrl ?? null;
  const initial = user.name?.[0]?.toUpperCase() ?? "?";
  const topInterests = user.interests.slice(0, 2);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card transition-all duration-200 hover:shadow-md">
      {/* 
        FIX: Image is fixed to the top. 
        Using aspect ratio so it scales perfectly on mobile and desktop.
      */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-background">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={user.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-4xl font-semibold text-primary">
            {initial}
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="truncate text-[17px] font-semibold text-foreground">
          {user.name}
        </h3>

        {/* Languages */}
        <dl className="mt-3 flex flex-col gap-1.5 text-[13px]">
          <div className="flex items-baseline gap-2">
            <dt className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Speaks
            </dt>
            <dd className="truncate font-medium text-foreground">
              {formatSpeaks(user, 2)}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Learning
            </dt>
            <dd className="truncate font-medium text-foreground">
              {formatLearning(user, 2)}
            </dd>
          </div>
        </dl>

        {/* Bio */}
        {user.bio && (
          <>
            <hr className="my-3 border-border/50" />
            <p className="line-clamp-2 text-[13px] italic leading-relaxed text-muted-foreground">
              {user.bio}
            </p>
          </>
        )}

        {/* Interests */}
        {topInterests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topInterests.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary"
              >
                <span aria-hidden="true">{getInterestEmoji(id)}</span>
                {getInterestLabel(id)}
              </span>
            ))}
          </div>
        )}

        {/* Call Button with Icon */}
        <div className="mt-auto pt-5">
          <SignUpButton
            mode="modal"
            forceRedirectUrl={`/app/calls/${user.id}`}
            signInForceRedirectUrl={`/app/calls/${user.id}`}
          >
            <button className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              <Phone className="h-4 w-4" />
              Call {firstName}
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  The Data Fetcher                                                           */
/* -------------------------------------------------------------------------- */
async function CommunityUsersList() {
  const result = await getHomepageCommunityUsers();

  if (!result.success || !result.users.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {result.users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Exported Section                                                      */
/* -------------------------------------------------------------------------- */
export function HomepageCommunity() {
  return (
    <section className="pb-10 sm:pb-12 lg:pb-14">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-[28px] font-normal tracking-[-0.02em] text-foreground">
          Meet our community.
        </h2>
      </div>

      {/* Grid with Suspense */}
      <Suspense fallback={<HomepageCommunitySkeleton />}>
        <CommunityUsersList />
      </Suspense>

      {/* See all link */}
      <div className="mt-8 flex justify-start">
        <a
          href="/community"
          className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary transition-colors hover:text-primary/80"
        >
          See all learners
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}