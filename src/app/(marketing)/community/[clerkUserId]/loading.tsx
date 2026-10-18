
export default function ProfileLoading() {
  return (
    <main className="pb-20 pt-8 sm:pt-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        
        {/* ── MAIN CARD SKELETON ────────────────────────────────────── */}
        <div className="w-full overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-sm">
          
          {/* Cover Image Skeleton */}
          <div className="h-[240px] w-full animate-pulse bg-muted sm:h-[320px]" />

          {/* Avatar & Info Skeleton */}
          <div className="relative flex flex-col items-center px-6 pb-8 text-center sm:px-10">
            
            {/* Floating Avatar */}
            <div className="relative -mt-16 mb-4 h-32 w-32 animate-pulse rounded-full border-[6px] border-card bg-muted sm:-mt-20 sm:h-40 sm:w-40" />

            {/* Name & Meta */}
            <div className="mt-2 h-10 w-64 animate-pulse rounded-lg bg-muted sm:h-12" />
            <div className="mt-4 h-4 w-40 animate-pulse rounded-md bg-muted" />

            {/* Bio */}
            <div className="mt-8 flex w-full max-w-lg flex-col items-center gap-2">
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
            </div>
          </div>

          {/* ── LANGUAGES & INTERESTS GRID SKELETON ───────────────────── */}
          <div className="mx-4 mb-4 grid grid-cols-1 gap-4 sm:mx-8 sm:grid-cols-2">
            
            {/* Speaks Skeleton */}
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="flex flex-col gap-2">
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            </div>

            {/* Learning Skeleton */}
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="flex flex-col gap-2">
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          </div>

          {/* Interests Skeleton */}
          <div className="mx-4 mb-8 rounded-2xl border border-border/60 p-5 sm:mx-8">
             <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
             <div className="flex flex-wrap gap-2">
                <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
             </div>
          </div>

          {/* ── ACTIONS SKELETON ───────────────────────────────────────── */}
          <div className="border-t border-border/60 bg-muted/10 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="h-14 flex-1 animate-pulse rounded-2xl bg-muted" />
              <div className="h-14 flex-1 animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}