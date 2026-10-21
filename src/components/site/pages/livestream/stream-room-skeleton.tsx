// src/components/site/pages/live-stream/stream-room-skeleton.tsx
// Server-safe (no hooks) – used as the <Suspense> fallback.

export function StreamRoomSkeleton() {
  return (
    <div
      className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_340px]"
      role="status"
      aria-label="Loading live stream"
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="aspect-video w-full animate-pulse rounded-2xl border border-border bg-muted" />
        <div className="mx-auto h-[72px] w-full max-w-xl animate-pulse rounded-2xl border border-border bg-muted/60" />
      </div>
      <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-muted/60 lg:h-auto" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}