export default function CommunityLoading() {
  return (
    <main className="pb-20 pt-10 sm:pt-16">
      {/* Header Skeleton */}
      <div className="mb-10 flex flex-col items-start gap-2">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-muted sm:h-14 sm:w-80" />
        <div className="mt-2 h-5 w-full max-w-md animate-pulse rounded bg-muted" />
        <div className="h-5 w-3/4 max-w-sm animate-pulse rounded bg-muted" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Toolbar Skeleton (Filter + View Toggle) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <div className="h-9 w-36 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-10 w-20 animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col animate-pulse overflow-hidden rounded-[24px] border border-border/60 bg-card p-2"
            >
              {/* Image Skeleton */}
              <div className="aspect-4/3 w-full rounded-[18px] bg-muted" />
              
              {/* Content Skeleton */}
              <div className="flex flex-col gap-3 p-4">
                {/* Name */}
                <div className="h-5 w-2/3 rounded bg-muted" />
                
                {/* Languages */}
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                
                {/* Divider & Bio */}
                <div className="my-1 h-px w-full bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-4/5 rounded bg-muted" />
                
                {/* Interests */}
                <div className="mt-1 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-muted" />
                  <div className="h-6 w-20 rounded-full bg-muted" />
                </div>

                {/* Button */}
                <div className="mt-3 h-10 w-full rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}