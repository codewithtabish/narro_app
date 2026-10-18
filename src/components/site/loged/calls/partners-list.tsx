// src/components/partners/PartnersList.tsx
import Image from "next/image";
import Link from "next/link";

import { getUsers } from "@/app/actions/partners/get-users-action";
import { getInterestEmoji, getInterestLabel } from "@/data/interests";
import { getLanguageName } from "@/data/languages";
import { cn } from "@/lib/utils";
import type { PartnerUser } from "@/types/types";

/* -------------------------------------------------------------------------- */
/*  Partners List — all users                                                  */
/*  Every card is one link → /calls/[clerkUserId]                              */
/* -------------------------------------------------------------------------- */

interface PartnersListProps {
  availableOnly?: boolean;
  view?: "list" | "grid";
}

export async function PartnersList({
  availableOnly = false,
  view = "list",
}: PartnersListProps) {
  const { users } = await getUsers({
    page: 1,
    limit: 20,
    available: availableOnly,
  });

  if (users.length === 0) {
    return <PartnersEmpty />;
  }

  return (
    <section
      aria-labelledby="all-partners-heading"
      className="flex w-full flex-col gap-3"
    >
      <h2
        id="all-partners-heading"
        className="font-serif text-[1.5rem] font-normal leading-tight tracking-[-0.015em] text-foreground sm:text-[1.75rem]"
      >
        All partners
      </h2>

      {view === "grid" ? (
        <GridView users={users} />
      ) : (
        <ListView users={users} />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// The profile page (/calls/[id]) loads the receiver by CLERK user id.
// Make sure `clerkUserId` is selected in getUsers and present on PartnerUser.
function profileHref(user: PartnerUser) {
  return `/app/calls/${user.clerkUserId}`;
}

const cardLinkClasses = cn(
  "group flex w-full overflow-hidden rounded-3xl bg-card",
  "ring-1 ring-border/60",
  "transition-shadow duration-200 hover:shadow-md",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
);

function formatLearning(user: PartnerUser, max: number) {
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

function formatSpeaks(user: PartnerUser, max: number) {
  return (
    user.languagesSpoken
      .slice(0, max)
      .map((code) => getLanguageName(code))
      .join(", ") || "—"
  );
}

/* -------------------------------------------------------------------------- */
/*  ListView — full-width rows                                                 */
/* -------------------------------------------------------------------------- */

function ListView({ users }: { users: PartnerUser[] }) {
  return (
    <ul className="flex w-full flex-col gap-4">
      {users.map((user) => {
        const avatarUrl = user.profileImageUrl ?? user.imageUrl ?? null;
        const initial = user.name?.[0]?.toUpperCase() ?? "?";
        const topInterests = user.interests.slice(0, 3);

        return (
          <li key={user.id} className="w-full">
            <Link
              href={profileHref(user)}
              aria-label={`View ${user.name}'s profile`}
              className={cn(cardLinkClasses, "flex-col sm:flex-row")}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "relative shrink-0 bg-background",
                  "aspect-3/2 w-full",
                  "sm:aspect-auto sm:w-[120px] sm:self-stretch lg:w-[140px]",
                )}
              >
                <AvatarImage
                  src={avatarUrl}
                  alt={user.name}
                  initial={initial}
                  sizes="(max-width: 640px) 100vw, 140px"
                />
                <StatusBadge isAvailable={user.isAvailable} />
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5 lg:p-6">
                <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                  {user.name}
                </h3>

                <dl className="mt-2 flex flex-col gap-0.5 text-[13px] sm:text-sm">
                  <LanguageRow label="Speaks" value={formatSpeaks(user, 3)} />
                  <LanguageRow
                    label="Learning"
                    value={formatLearning(user, 3)}
                  />
                </dl>

                {user.bio && (
                  <p className="mt-3 line-clamp-2 text-[13px] italic leading-relaxed text-muted-foreground">
                    {user.bio}
                  </p>
                )}

                {topInterests.length > 0 && (
                  <div className="mt-3">
                    <InterestTags items={topInterests} />
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*  GridView — compact cards                                                   */
/* -------------------------------------------------------------------------- */

function GridView({ users }: { users: PartnerUser[] }) {
  return (
    <ul
      className={cn(
        "grid w-full gap-4",
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4",
      )}
    >
      {users.map((user) => {
        const avatarUrl = user.profileImageUrl ?? user.imageUrl ?? null;
        const initial = user.name?.[0]?.toUpperCase() ?? "?";
        const topInterests = user.interests.slice(0, 2);

        return (
          <li key={user.id} className="flex">
            <Link
              href={profileHref(user)}
              aria-label={`View ${user.name}'s profile`}
              className={cn(cardLinkClasses, "flex-col")}
            >
              {/* Avatar — square top */}
              <div className="relative aspect-square w-full bg-background">
                <AvatarImage
                  src={avatarUrl}
                  alt={user.name}
                  initial={initial}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <StatusBadge isAvailable={user.isAvailable} />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {user.name}
                </h3>

                <dl className="flex flex-col gap-0.5 text-[12px]">
                  <LanguageRow label="Speaks" value={formatSpeaks(user, 2)} />
                  <LanguageRow
                    label="Learning"
                    value={formatLearning(user, 2)}
                  />
                </dl>

                {topInterests.length > 0 && (
                  <div className="mt-1">
                    <InterestTags items={topInterests} />
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

function AvatarImage({
  src,
  alt,
  initial,
  sizes,
}: {
  src: string | null;
  alt: string;
  initial: string;
  sizes: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
      />
    );
  }
  return (
    <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-primary">
      {initial}
    </span>
  );
}

function StatusBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={cn(
        "absolute left-2.5 top-2.5",
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
        "text-[10px] font-bold uppercase tracking-[0.08em]",
        "backdrop-blur-sm",
        isAvailable
          ? "bg-emerald-500/90 text-white"
          : "bg-neutral-800/80 text-white",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isAvailable ? "bg-white" : "bg-white/70",
        )}
      />
      {isAvailable ? "Available" : "Unavailable"}
    </span>
  );
}

function LanguageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <dt className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate font-medium text-foreground">{value}</dd>
    </div>
  );
}

function InterestTags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((id) => (
        <li
          key={id}
          className={cn(
            "inline-flex items-center gap-1 rounded-full",
            "bg-primary/8 px-2.5 py-1",
            "text-[11px] font-medium text-primary",
          )}
        >
          <span aria-hidden="true">{getInterestEmoji(id)}</span>
          {getInterestLabel(id)}
        </li>
      ))}
    </ul>
  );
}

function PartnersEmpty() {
  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="font-serif text-[1.5rem] font-normal leading-tight tracking-[-0.015em] text-foreground sm:text-[1.75rem]">
        All partners
      </h2>
      <div
        className={cn(
          "w-full rounded-3xl border border-dashed border-border",
          "bg-secondary/40 p-10 text-center",
        )}
      >
        <p className="text-base font-medium text-foreground">
          No partners available yet
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back soon — new learners join NARRO every day.
        </p>
      </div>
    </section>
  );
}