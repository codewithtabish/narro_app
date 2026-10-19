// src/app/rooms/loading.tsx
export default function RoomsLoading() {
  return (
    <main className="py-10">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-[48px] w-[300px] animate-pulse rounded-lg bg-muted" />
          <div className="mt-3 h-[20px] w-[400px] animate-pulse rounded bg-muted" />
        </div>
        <div className="h-12 w-[160px] animate-pulse rounded-full bg-muted" />
      </div>

      {/* Grid Skeleton */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-[240px] animate-pulse flex-col gap-4 rounded-3xl border border-border bg-card p-6">
            <div className="flex justify-between">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
            <div className="h-8 w-2/3 rounded bg-muted mt-2" />
            <div className="h-4 w-1/3 rounded bg-muted mt-1" />
            <div className="mt-auto flex justify-between items-center">
              <div className="h-8 w-24 rounded-full bg-muted" />
              <div className="h-8 w-20 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}