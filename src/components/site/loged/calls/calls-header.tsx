import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Calls Header                                                               */
/* -------------------------------------------------------------------------- */

export function CallsHeader() {
  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex flex-col">
        <h1 className="font-serif text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[2.5rem] lg:text-[2.75rem]">
          Calls
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
          Connect with real language partners and practice together.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Search partners"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full",
            "border border-border bg-card text-muted-foreground",
            "transition-colors duration-200",
            "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </button>

        <button
          type="button"
          aria-label="Filter partners"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full",
            "border border-border bg-card text-muted-foreground",
            "transition-colors duration-200",
            "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </button>
      </div>
    </header>
  );
}