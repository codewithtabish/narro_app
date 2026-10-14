import Image from "next/image";

import { getUsers } from "@/app/actions/partners/get-users-action";
import { getLanguageFlag, getLanguageName } from "@/data/languages";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Online Now Strip                                                           */
/* -------------------------------------------------------------------------- */

export async function OnlineNowStrip() {
  const { users } = await getUsers({ limit: 6, online: true });

  if (users.length === 0) return null;

  return (
    <section
      aria-labelledby="online-now-heading"
      className="flex flex-col gap-5"
    >
      <h2
        id="online-now-heading"
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
      >
        Online Now · {users.length}{" "}
        {users.length === 1 ? "Partner" : "Partners"}
      </h2>

      <ul
        className={cn(
          "grid gap-6",
          "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
        )}
      >
        {users.map((user) => {
          const avatarUrl =
            user.profileImageUrl ?? user.imageUrl ?? null;
          const initial = user.name?.[0]?.toUpperCase() ?? "?";

          return (
            <li
              key={user.id}
              className="flex flex-col items-center text-center"
            >
              <div className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -inset-2 rounded-full",
                    "bg-primary/6",
                  )}
                />
                <div
                  className={cn(
                    "relative h-[84px] w-[84px] overflow-hidden rounded-full",
                    "ring-2 ring-border",
                    "bg-secondary",
                  )}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user.name}
                      fill
                      sizes="84px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
                      {initial}
                    </span>
                  )}
                </div>

                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-0.5 right-0.5",
                    "h-3.5 w-3.5 rounded-full",
                    "bg-(--color-online,#22C55E)",
                    "ring-[3px] ring-card",
                  )}
                />
              </div>

              <p className="mt-3 max-w-full truncate text-[13px] font-semibold text-foreground">
                {user.name}
              </p>

              {user.languagesSpoken[0] && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span aria-hidden="true">
                    {getLanguageFlag(user.languagesSpoken[0])}
                  </span>
                  <span className="truncate">
                    {getLanguageName(user.languagesSpoken[0])}
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}