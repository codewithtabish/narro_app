// src/components/livestream/live-streams-wrapper.tsx
import { Video } from "lucide-react";
import { Suspense } from "react";

import { getLiveStreams } from "@/app/actions/livestream/get-live-streams";
import { CreateStreamButton } from "./create-stream-button";
import { LiveStreamCard } from "./live-stream-card";
import { LiveStreamListCard } from "./live-stream-list-card";

// ── 1. SKELETON LOADERS ──
function GridSkeleton() {
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

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col sm:flex-row items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm animate-pulse">
          <div className="h-32 w-full sm:w-56 shrink-0 rounded-2xl bg-muted/60" />
          <div className="flex w-full flex-col gap-3">
            <div className="h-6 w-3/4 rounded-md bg-muted/60" />
            <div className="h-4 w-full rounded-md bg-muted/60" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-8 w-24 rounded-full bg-muted/60" />
              <div className="h-9 w-28 rounded-full bg-muted/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 2. DATA FETCHER & RENDERER ──
async function StreamData({ view }: { view: "grid" | "list" }) {
  const result = await getLiveStreams();

  if (!result.success) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-red-200 bg-red-50 text-red-500">
        <p>Failed to load streams: {result.error}</p>
      </div>
    );
  }

  const streams = result.streams;

  if (streams.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/20 text-center px-4">
        <div className="rounded-full bg-muted p-4">
          <Video className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-foreground">No live streams right now</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Be the first to start broadcasting and practice languages with the community!
        </p>
        <div className="mt-6">
          <CreateStreamButton />
        </div>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {streams.map((stream) => (
          <LiveStreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {streams.map((stream) => (
        <LiveStreamListCard key={stream.id} stream={stream} />
      ))}
    </div>
  );
}

// ── 3. MAIN WRAPPER WITH SUSPENSE ──
export function LiveStreamsWrapper({ view = "grid" }: { view?: "grid" | "list" }) {
  return (
    <Suspense fallback={view === "grid" ? <GridSkeleton /> : <ListSkeleton />}>
      <StreamData view={view} />
    </Suspense>
  );
}