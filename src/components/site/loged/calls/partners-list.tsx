import { MessageCircle, Phone } from "lucide-react";
import Image from "next/image";

import { getUsers } from "@/app/actions/partners/get-users-action";
import { getInterestEmoji, getInterestLabel } from "@/data/interests";
import { getLanguageName } from "@/data/languages";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Partners List — all users                                                  */
/* -------------------------------------------------------------------------- */

export async function PartnersList() {
  const { users } = await getUsers({ page: 1, limit: 20 });

  if (users.length === 0) {
    return (
      <section className="flex w-full flex-col gap-5">
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

  return (
    <section
      aria-labelledby="all-partners-heading"
      className="flex w-full flex-col gap-5"
    >
      <h2
        id="all-partners-heading"
        className="font-serif text-[1.5rem] font-normal leading-tight tracking-[-0.015em] text-foreground sm:text-[1.75rem]"
      >
        All partners
      </h2>

      <ul className="flex w-full flex-col gap-4">
        {users.map((user) => {
          const avatarUrl =
            user.profileImageUrl ?? user.imageUrl ?? null;
          const initial = user.name?.[0]?.toUpperCase() ?? "?";
          const isOnline = user.status === "ONLINE";
          const topInterests = user.interests.slice(0, 3);

          return (
            <li
              key={user.id}
              className={cn(
                "group relative flex w-full overflow-hidden rounded-3xl bg-card",
                "ring-1 ring-border/60",
                "transition-shadow duration-200 hover:shadow-md",
                "flex-col lg:flex-row",
              )}
            >
              {/* ═══════════════════════════════════════════════════ */}
              {/* AVATAR — square, fills full card height              */}
              {/* ═══════════════════════════════════════════════════ */}
              <div
                className={cn(
                  "relative shrink-0",
                  // Neutral background (no yellow/amber)
                  "bg-background",
                  "aspect-square w-full",
                  "lg:aspect-auto lg:w-[140px] lg:self-stretch",
                )}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={user.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 140px"
                    className="object-cover"
                  />
                ) : (
                  <span
                    className={cn(
                      "flex h-full w-full items-center justify-center",
                      "text-3xl font-semibold text-primary",
                    )}
                  >
                    {initial}
                  </span>
                )}

                {/* Status badge — top-left corner, neutral style */}
                <span
                  className={cn(
                    "absolute left-2.5 top-2.5",
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                    "text-[10px] font-bold uppercase tracking-[0.08em]",
                    "backdrop-blur-sm",
                    isOnline
                      ? "bg-emerald-500/90 text-white"
                      : "bg-neutral-800/80 text-white",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isOnline ? "bg-white" : "bg-white/70",
                    )}
                  />
                  {isOnline ? "Online" : "Away"}
                </span>
              </div>

              {/* ═══════════════════════════════════════════════════ */}
              {/* INFO                                                 */}
              {/* ═══════════════════════════════════════════════════ */}
              <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-6">
                <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                  {user.name}
                </h3>

                <dl className="mt-2 flex flex-col gap-0.5 text-[13px] sm:text-sm">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <dt className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Speaks
                    </dt>
                    <dd className="font-medium text-foreground">
                      {user.languagesSpoken
                        .slice(0, 3)
                        .map((code) => getLanguageName(code))
                        .join(", ") || "—"}
                    </dd>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <dt className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Learning
                    </dt>
                    <dd className="font-medium text-foreground">
                      {user.languagesLearning
                        .slice(0, 3)
                        .map((code) => {
                          const level =
                            user.proficiencyByLanguage?.[code];
                          const name = getLanguageName(code);
                          return level
                            ? `${name} (${level.charAt(0)})`
                            : name;
                        })
                        .join(", ") || "—"}
                    </dd>
                  </div>
                </dl>

                {user.bio && (
                  <p className="mt-3 text-[13px] italic leading-relaxed text-muted-foreground">
                    {user.bio}
                  </p>
                )}

                {topInterests.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {topInterests.map((id) => (
                      <li
                        key={id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full",
                          "bg-primary/8 px-2.5 py-1",
                          "text-[11px] font-medium text-primary",
                        )}
                      >
                        <span aria-hidden="true">
                          {getInterestEmoji(id)}
                        </span>
                        {getInterestLabel(id)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════ */}
              {/* ACTIONS                                              */}
              {/* ═══════════════════════════════════════════════════ */}
              <div
                className={cn(
                  "flex shrink-0 gap-2 px-5 pb-5 sm:px-6 sm:pb-6",
                  "flex-row",
                  "lg:flex-col lg:items-stretch lg:self-center lg:px-6 lg:py-6",
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-5",
                    "bg-primary text-primary-foreground",
                    "text-sm font-semibold",
                    "shadow-[0_6px_16px_-6px_var(--color-primary)]",
                    "transition-all duration-200",
                    "hover:bg-primary/90",
                    "active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    "lg:w-32 lg:flex-none",
                  )}
                >
                  <Phone className="h-4 w-4" strokeWidth={2.25} />
                  Call
                </button>

                <button
                  type="button"
                  className={cn(
                    "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-5",
                    "border border-border bg-card text-foreground",
                    "text-sm font-semibold",
                    "transition-all duration-200",
                    "hover:border-primary/40 hover:bg-primary/5",
                    "active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    "lg:w-32 lg:flex-none",
                  )}
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2.25} />
                  Message
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}