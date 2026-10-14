"use client";

import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Start Speaking Button — navigates to /app/ai                               */
/* -------------------------------------------------------------------------- */

export function StartSpeakingButton() {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const handleClick = () => {
    setIsPending(true);
    router.push("/app/ai");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label="Start an AI speaking session"
      className={cn(
        "inline-flex h-12 items-center gap-2.5 rounded-full bg-primary px-6",
        "text-[0.9rem] font-semibold text-primary-foreground shadow-sm",
        "transition-colors duration-200",
        "hover:bg-primary/90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-80",
      )}
    >
      <Mic className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      {isPending ? "Starting…" : "Start speaking"}
    </button>
  );
}