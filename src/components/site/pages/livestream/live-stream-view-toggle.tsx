// src/components/livestream/live-stream-view-toggle.tsx
"use client";

import { LayoutGrid, List } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function LiveStreamViewToggle({ currentView }: { currentView: "grid" | "list" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = (view: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center rounded-full border border-border bg-background p-1 shadow-sm">
      <button
        onClick={() => setView("grid")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          currentView === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => setView("list")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          currentView === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="List view"
      >
        <List size={16} />
      </button>
    </div>
  );
}