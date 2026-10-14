import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Partners List — Skeleton                                                   */
/* -------------------------------------------------------------------------- */

export function PartnersSkeleton() {
  return (
    <section className="flex flex-col gap-5">
      <div className="h-7 w-40 animate-pulse rounded bg-secondary/60" />

      <ul className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className={cn(
              "flex flex-col gap-5 rounded-3xl bg-card p-5 ring-1 ring-border/60 sm:p-6",
              "lg:flex-row lg:items-center lg:gap-6",
            )}
          >
            <div className="flex flex-1 items-start gap-4 lg:gap-5">
              <div className="h-[72px] w-[72px] shrink-0 animate-pulse rounded-full bg-secondary/60" />

              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-32 animate-pulse rounded bg-secondary/60" />
                <div className="h-3 w-48 animate-pulse rounded bg-secondary/60" />
                <div className="h-3 w-40 animate-pulse rounded bg-secondary/60" />
                <div className="h-2.5 w-56 animate-pulse rounded bg-secondary/60" />
                <div className="mt-1 flex gap-1.5">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-secondary/60" />
                  <div className="h-6 w-14 animate-pulse rounded-full bg-secondary/60" />
                  <div className="h-6 w-16 animate-pulse rounded-full bg-secondary/60" />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-2 lg:flex-col">
              <div className="h-10 flex-1 animate-pulse rounded-full bg-secondary/60 lg:w-32 lg:flex-none" />
              <div className="h-10 flex-1 animate-pulse rounded-full bg-secondary/60 lg:w-32 lg:flex-none" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}