"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ViewMode = "list" | "grid";

/* -------------------------------------------------------------------------- */
/*  ViewToggle                                                                 */
/* -------------------------------------------------------------------------- */

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [isPending, startTransition] = React.useTransition();

  const current: ViewMode =
    searchParams.get("view") === "grid" ? "grid" : "list";

  const setView = (view: ViewMode) => {
    if (view === current) return;

    const params = new URLSearchParams(searchParams.toString());
    if (view === "list") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  };

  return (
    <div
      role="tablist"
      aria-label="View mode"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5",
        isPending && "opacity-60",
      )}
    >
      <ToggleButton
        active={current === "list"}
        onClick={() => setView("list")}
        aria-label="List view"
        icon={<List className="h-4 w-4" strokeWidth={2.25} />}
        reduceMotion={reduceMotion}
      />
      <ToggleButton
        active={current === "grid"}
        onClick={() => setView("grid")}
        aria-label="Grid view"
        icon={<LayoutGrid className="h-4 w-4" strokeWidth={2.25} />}
        reduceMotion={reduceMotion}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ToggleButton                                                               */
/* -------------------------------------------------------------------------- */

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  reduceMotion: boolean | null;
  "aria-label": string;
}

function ToggleButton({
  active,
  onClick,
  icon,
  reduceMotion,
  ...aria
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      {...aria}
      className={cn(
        "relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-card",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="view-toggle-indicator"
          transition={{
            duration: reduceMotion ? 0 : 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 -z-10 rounded-full bg-primary"
        />
      )}
      {icon}
    </button>
  );
}