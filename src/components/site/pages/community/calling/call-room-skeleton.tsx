// src/components/site/loged/active/calls/call-room-skeleton.tsx
"use client";

import { Loader2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  CallRoomSkeleton                                                           */
/* -------------------------------------------------------------------------- */
/**
 * Shown instantly while the CallRoom page is loading.
 * 
 * IMPORTANT: No background colors are used here. It inherits the 
 * layout's default background so there is no "dark flash".
 */
export function CallRoomSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-transparent">
      
      {/* Center Loader */}
      <div className="flex flex-col items-center gap-4 text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Connecting to call…
        </p>
      </div>

    </div>
  );
}