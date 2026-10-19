// src/components/site/pages/rooms/rooms-skeleton.tsx
export function RoomsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}