export default function LandingLoading() {
  return (
    <div className="flex flex-col gap-16 pb-20 pt-8">
      
      {/* 1. Hero Skeleton */}
      <section className="flex flex-col items-center px-4 text-center">
        <div className="h-6 w-32 animate-pulse rounded-full bg-muted" />
        <div className="mt-6 h-12 w-3/4 max-w-2xl animate-pulse rounded-lg bg-muted sm:h-16" />
        <div className="mt-4 h-6 w-1/2 max-w-lg animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 flex gap-4">
          <div className="h-12 w-40 animate-pulse rounded-full bg-muted" />
          <div className="h-12 w-40 animate-pulse rounded-full bg-muted" />
        </div>
      </section>

      {/* 2. Features Row Skeleton */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[400px] animate-pulse rounded-3xl bg-muted" />
        ))}
      </section>

      {/* 3. Community Preview Skeleton (Real Data) */}
      <section>
        <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse overflow-hidden rounded-3xl border border-border/60 bg-card">
              <div className="aspect-4/3 w-full bg-muted" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-5 w-1/2 rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-4 h-10 w-full rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Rooms Preview Skeleton */}
      <section>
        <div className="mb-6 h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[180px] animate-pulse rounded-[24px] border border-border/60 bg-card" />
          ))}
        </div>
      </section>

    </div>
  );
}