import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Online Now — Skeleton                                                      */
/* -------------------------------------------------------------------------- */

export function OnlineNowSkeleton() {
  return (
    <section className="flex flex-col gap-5">
      <div className="h-3 w-40 animate-pulse rounded bg-secondary/60" />

      <ul
        className={cn(
          "grid gap-6",
          "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex flex-col items-center">
            <div className="h-[84px] w-[84px] animate-pulse rounded-full bg-secondary/60" />
            <div className="mt-3 h-3 w-20 animate-pulse rounded bg-secondary/60" />
            <div className="mt-1.5 h-2.5 w-14 animate-pulse rounded bg-secondary/60" />
          </li>
        ))}
      </ul>
    </section>
  );
}