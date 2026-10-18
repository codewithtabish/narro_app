// src/app/(loged)/app/calls/[id]/loading.tsx

/* -------------------------------------------------------------------------- */
/*  Skeleton primitive — theme-aware (works in light + dark)                   */
/* -------------------------------------------------------------------------- */

function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-muted ${className}`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading UI for /app/calls/[id]                                             */
/*  Mirrors the layout of <ReceiverProfileContent /> exactly.                  */
/* -------------------------------------------------------------------------- */

export default function ReceiverLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading profile"
      className="w-full min-w-0"
    >
      {/* Back link */}
      <Bone className="mb-3 h-4 w-28" />

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,344px)]">
        {/* ───────────────────────── LEFT COLUMN ───────────────────────── */}
        <div className="min-w-0">
          {/* Banner */}
          <Bone className="h-[140px] w-full rounded-xl sm:h-[165px] lg:h-[180px]" />

          {/* Avatar */}
          <div className="ml-4 mt-[-46px] h-24 w-24 animate-pulse rounded-full border-4 border-background bg-muted-foreground/20 sm:ml-5 sm:mt-[-60px] sm:h-32 sm:w-32" />

          {/* Name + language chips + stats */}
          <div className="ml-1 mt-3 sm:ml-5">
            <Bone className="h-9 w-56 max-w-full sm:h-10" />

            <div className="mt-3 flex flex-wrap gap-2">
              <Bone className="h-7 w-24 rounded-full" />
              <Bone className="h-7 w-24 rounded-full" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div>
                <Bone className="h-6 w-10" />
                <Bone className="mt-2 h-3 w-20" />
              </div>
              <div>
                <Bone className="h-5 w-32" />
                <Bone className="mt-2 h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Learning */}
          <div className="mt-5 border-t border-border pt-3">
            <Bone className="h-3 w-16" />
            <div className="mt-2 space-y-1">
              <Bone className="h-[45px] w-full rounded-lg" />
              <Bone className="h-[45px] w-full rounded-lg" />
            </div>
          </div>

          {/* About */}
          <div className="mt-4 border-t border-border pt-4">
            <Bone className="h-3 w-14" />
            <div className="mt-3 space-y-2">
              <Bone className="h-3.5 w-full" />
              <Bone className="h-3.5 w-11/12" />
              <Bone className="h-3.5 w-2/3" />
            </div>
          </div>

          {/* Interests */}
          <div className="mt-4 border-t border-border pt-4">
            <Bone className="h-3 w-20" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Bone className="h-8 w-24 rounded-full" />
              <Bone className="h-8 w-20 rounded-full" />
              <Bone className="h-8 w-28 rounded-full" />
              <Bone className="h-8 w-24 rounded-full" />
            </div>
          </div>

          {/* Recent calls */}
          <div className="mt-4 border-t border-border pt-4">
            <Bone className="h-3 w-40" />
            <div className="mt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex min-h-[48px] items-center justify-between gap-3 border-b border-border py-2 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Bone className="h-8 w-8 rounded-full" />
                    <Bone className="h-3.5 w-28" />
                  </div>
                  <Bone className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ───────────────────────── RIGHT COLUMN ───────────────────────── */}
        <div className="min-w-0 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-border p-4 sm:p-6">
            <Bone className="h-3 w-40" />

            <div className="mt-5 space-y-3">
              <Bone className="h-[52px] w-full rounded-full" />
              <Bone className="h-[52px] w-full rounded-full" />
            </div>

            <div className="my-6 border-t border-border" />

            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[85px_minmax(0,1fr)] gap-3 sm:grid-cols-[100px_minmax(0,1fr)]"
                >
                  <Bone className="h-3 w-14" />
                  <Bone className="h-3.5 w-3/4" />
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-border" />

            <div className="space-y-2">
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-4/5" />
            </div>
          </div>

          <Bone className="mt-4 h-11 w-full rounded-xl" />
        </div>
      </div>

      <span className="sr-only">Loading receiver profile…</span>
    </div>
  );
}