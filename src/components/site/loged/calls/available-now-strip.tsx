import Image from "next/image";

import { getUsers } from "@/app/actions/partners/get-users-action";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Available Now Strip                                                        */
/* -------------------------------------------------------------------------- */
/**
 * Avatar-only strip. Circular avatars like messaging apps.
 * Green dot shows they're currently available.
 */

export async function AvailableNowStrip() {
  const { users } = await getUsers({ limit: 6, available: true });

  if (users.length === 0) return null;

  return (
    <section
      aria-labelledby="available-now-heading"
      className="flex flex-col gap-2"
    >
      <h2
        id="available-now-heading"
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
      >
        Available Now · {users.length}{" "}
        {users.length === 1 ? "Partner" : "Partners"}
      </h2>

      <ul
        className={cn(
          "grid gap-4",
          "grid-cols-4 sm:grid-cols-5 lg:grid-cols-6",
        )}
      >
        {users.map((user) => {
          const avatarUrl =
            user.profileImageUrl ?? user.imageUrl ?? null;
          const initial = user.name?.[0]?.toUpperCase() ?? "?";

          return (
            <li key={user.id} className="flex justify-center">
              {/* ─── Circular avatar ─── */}
              <div className="relative">
                <div
                  className={cn(
                    "relative h-[68px] w-[68px] overflow-hidden rounded-full",
                    "bg-secondary",
                    "ring-2 ring-card",
                    "sm:h-[72px] sm:w-[72px]",
                  )}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user.name}
                      fill
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 16vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">
                      {initial}
                    </span>
                  )}
                </div>

                {/* Green online dot — bottom-right */}
                <span
                  aria-label={`${user.name} is available`}
                  className={cn(
                    "absolute bottom-0 right-0",
                    "h-[14px] w-[14px] rounded-full",
                    "bg-emerald-500",
                    "ring-[2.5px] ring-card",
                  )}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}