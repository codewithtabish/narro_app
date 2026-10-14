"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Tabs + filter chips                                                        */
/* -------------------------------------------------------------------------- */

type Tab = "partners" | "history";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function CallsTabs() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = React.useState<Tab>("partners");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Segmented tabs */}
      <div
        role="tablist"
        aria-label="Calls view"
        className={cn(
          "inline-flex w-full shrink-0 items-center rounded-full p-1 lg:w-auto",
          "bg-secondary",
        )}
      >
        {(
          [
            { id: "partners", label: "Find Partners" },
            { id: "history", label: "Call History" },
          ] as const
        ).map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative z-10 flex-1 lg:flex-initial",
                "inline-flex h-10 items-center justify-center rounded-full px-5",
                "text-sm font-semibold transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="calls-tab-indicator"
                  transition={{
                    duration: reduceMotion ? 0 : 0.3,
                    ease: EASE_OUT,
                  }}
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-sm"
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none [&::-webkit-scrollbar]:hidden">
        <FilterChip
          label="Any language"
          icon={<Globe className="h-3.5 w-3.5" strokeWidth={2.25} />}
          active
        />
        <FilterChip label="Available now" />
        <FilterChip label="Any level" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FilterChip                                                                 */
/* -------------------------------------------------------------------------- */

function FilterChip({
  label,
  icon,
  active = false,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5",
        "text-[13px] font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border border-primary bg-primary/10 text-primary"
          : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      {icon && (
        <span aria-hidden="true" className="text-current">
          {icon}
        </span>
      )}
      <span>{label}</span>
      <ChevronDown
        className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-hover:translate-y-px"
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </button>
  );
}