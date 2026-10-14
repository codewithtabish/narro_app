"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CallsTab = "partners" | "history";

interface CallsTabsProps {
  activeTab: CallsTab;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  CallsTabs                                                                  */
/* -------------------------------------------------------------------------- */

export function CallsTabs({ activeTab }: CallsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [isPending, startTransition] = React.useTransition();

  const handleTabChange = (tab: CallsTab) => {
    if (tab === activeTab) return;

    const params = new URLSearchParams(searchParams.toString());
    if (tab === "partners") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
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
      aria-label="Calls view"
      className={cn(
        "inline-flex w-full shrink-0 items-center rounded-full p-1 lg:w-auto",
        "bg-secondary",
        isPending && "opacity-60",
      )}
    >
      {(
        [
          { id: "partners", label: "Find Partners" },
          { id: "history", label: "Call History" },
        ] as const
      ).map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabChange(tab.id)}
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
  );
}