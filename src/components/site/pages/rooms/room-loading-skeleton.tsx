// src/components/site/pages/rooms/room-loading-skeleton.tsx
export function RoomLoadingSkeleton() {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Ambient Glow (Using primary token) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[800px] w-[800px] rounded-full bg-primary opacity-10 blur-[120px]" />
      </div>

      {/* Top Navbar Skeleton */}
      <div className="relative z-10 flex w-full items-center justify-between px-6 py-6 sm:px-10">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="absolute left-1/2 -translate-x-1/2 h-6 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
      </div>

      {/* Avatar Grid Skeleton */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12 max-w-3xl w-full place-items-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-5">
              <div className="h-32 w-32 sm:h-40 sm:w-40 animate-pulse rounded-full bg-muted border-2 border-border" />
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Control Dock Skeleton */}
      <div className="relative z-10 pb-12 flex justify-center">
        <div className="h-20 w-64 animate-pulse rounded-full bg-muted border border-border" />
      </div>
    </div>
  );
}