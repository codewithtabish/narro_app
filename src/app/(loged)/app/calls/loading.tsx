export default function CallsLoading() {
  return (
    <div className="flex w-full flex-col gap-10 pb-10 lg:gap-14">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADER + TABS                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="h-9 w-24 animate-pulse rounded bg-secondary/60 sm:h-11 sm:w-32 lg:h-12 lg:w-36" />
            <div className="h-4 w-56 animate-pulse rounded bg-secondary/60 sm:h-5 sm:w-72" />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-secondary/60" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-secondary/60" />
          </div>
        </div>

        {/* Tabs + filter chips */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Segmented tabs */}
          <div className="inline-flex w-full items-center rounded-full bg-secondary p-1 lg:w-auto">
            <div className="h-10 flex-1 animate-pulse rounded-full bg-secondary/60 lg:w-40 lg:flex-none" />
            <div className="h-10 flex-1 animate-pulse rounded-full bg-secondary/60 lg:w-36 lg:flex-none" />
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
            <div className="h-9 w-32 shrink-0 animate-pulse rounded-full bg-secondary/60" />
            <div className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-secondary/60" />
            <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-secondary/60" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ONLINE NOW                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-5">
        <div className="h-3 w-32 animate-pulse rounded bg-secondary/60 sm:w-40" />

        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className={
                "flex flex-col items-center " +
                (i >= 3 ? "hidden sm:flex " : "") +
                (i >= 4 ? "sm:hidden lg:flex " : "")
              }
            >
              <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-secondary/60 sm:h-[80px] sm:w-[80px] lg:h-[84px] lg:w-[84px]" />
              <div className="mt-3 h-2.5 w-16 animate-pulse rounded bg-secondary/60 sm:h-3 sm:w-20" />
              <div className="mt-1.5 h-2 w-12 animate-pulse rounded bg-secondary/60 sm:h-2.5 sm:w-14" />
            </li>
          ))}
        </ul>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ALL PARTNERS                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-4 sm:gap-5">
        <div className="h-6 w-32 animate-pulse rounded bg-secondary/60 sm:h-7 sm:w-40" />

        <ul className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="flex flex-col gap-4 rounded-3xl bg-card p-4 ring-1 ring-border/60 sm:p-5 lg:flex-row lg:items-center lg:gap-6 lg:p-6"
            >
              <div className="flex flex-1 items-start gap-3 sm:gap-4 lg:gap-5">
                {/* Avatar */}
                <div className="h-[60px] w-[60px] shrink-0 animate-pulse rounded-full bg-secondary/60 sm:h-[68px] sm:w-[68px] lg:h-[72px] lg:w-[72px]" />

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-28 animate-pulse rounded bg-secondary/60 sm:h-[18px] sm:w-32" />
                    <div className="h-4 w-14 animate-pulse rounded-full bg-secondary/60 sm:h-[18px] sm:w-16" />
                  </div>

                  <div className="h-3 w-40 animate-pulse rounded bg-secondary/60 sm:h-3.5 sm:w-48" />
                  <div className="h-3 w-32 animate-pulse rounded bg-secondary/60 sm:h-3.5 sm:w-40" />
                  <div className="h-2.5 w-48 animate-pulse rounded bg-secondary/60 sm:h-3 sm:w-56" />

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <div className="h-5 w-14 animate-pulse rounded-full bg-secondary/60 sm:h-6 sm:w-16" />
                    <div className="h-5 w-12 animate-pulse rounded-full bg-secondary/60 sm:h-6 sm:w-14" />
                    <div className="hidden h-6 w-16 animate-pulse rounded-full bg-secondary/60 sm:block" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2 lg:w-32 lg:flex-col">
                <div className="h-10 flex-1 animate-pulse rounded-full bg-secondary/60 lg:w-full lg:flex-none" />
                <div className="h-10 flex-1 animate-pulse rounded-full bg-secondary/60 lg:w-full lg:flex-none" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}