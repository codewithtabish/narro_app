"use client";

import { useState } from "react";

/**
 * Closes the payment tab and returns the viewer to the stream.
 * Browsers only allow window.close() on tabs a script opened (ours is),
 * so if it doesn't close we show a plain instruction instead.
 */
export function CloseTabButton({ label = "Back to the stream" }: { label?: string }) {
  const [stuck, setStuck] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => {
          window.close();
          // If we're still here a moment later, the browser refused to close the tab.
          setTimeout(() => setStuck(true), 250);
        }}
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-linear-to-r from-[#6B4A3A] to-[#8a5f4a] px-6 text-sm font-semibold text-white shadow-lg shadow-[#6B4A3A]/30 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4A3A] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
      >
        {label}
      </button>
      {stuck && (
        <p role="status" className="text-xs text-muted-foreground">
          Close this tab yourself to go back to the stream.
        </p>
      )}
    </div>
  );
}