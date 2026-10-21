// src/app/live-stream/page.tsx

import { CreateStreamButton } from "@/components/site/pages/livestream/create-stream-button";
import { LiveStreamViewToggle } from "@/components/site/pages/livestream/live-stream-view-toggle";
import { LiveStreamsWrapper } from "@/components/site/pages/livestream/live-streams-wrapper";
import { Suspense } from "react";

// ✅ 1. Move the searchParams logic inside a Suspense boundary
async function LiveStreamContent({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const resolvedParams = await searchParams;
  const view = resolvedParams.view === "list" ? "list" : "grid";

  return <LiveStreamsWrapper view={view} />;
}

// ✅ 2. A tiny wrapper for the toggle to keep the header instant
async function ToggleWrapper({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const resolvedParams = await searchParams;
  const view = resolvedParams.view === "list" ? "list" : "grid";
  return <LiveStreamViewToggle currentView={view} />;
}

// ✅ 3. The main page shell (renders instantly)
export default function LiveStreamsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  return (
    // ✅ NO horizontal padding, NO background.
    // Only vertical spacing.
    <div className="py-8">
      {/* ── HEADER ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Live Streams
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Watch real people practice languages in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#E53935]" />
            Live Now
          </div>

          {/* ✅ Suspense for the Toggle */}
          <Suspense fallback={<div className="h-10 w-20 rounded-full bg-muted/20 animate-pulse" />}>
            <ToggleWrapper searchParams={searchParams} />
          </Suspense>

          <CreateStreamButton />
        </div>
      </div>

      {/* ── STREAMS WRAPPER ── */}
      {/* ✅ Suspense for the Stream List */}
      <Suspense fallback={<StreamsSkeleton />}>
        <LiveStreamContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// ✅ 4. Fallback Skeleton to prevent layout shift while loading
function StreamsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm animate-pulse">
          <div className="aspect-video w-full bg-muted/60" />
          <div className="flex flex-col gap-3 p-5">
            <div className="h-5 w-3/4 rounded-md bg-muted/60" />
            <div className="h-4 w-full rounded-md bg-muted/60" />
            <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-muted/60" />
                <div className="h-4 w-16 rounded-md bg-muted/60" />
              </div>
              <div className="h-8 w-28 rounded-full bg-muted/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}