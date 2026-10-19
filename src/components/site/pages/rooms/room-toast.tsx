// src/components/site/pages/rooms/room-toast.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";

export function RoomToast() {
  // ✅ 1. Read sessionStorage immediately during the initial render.
  // This avoids the React 19 "setState in effect" warning.
  const [message, setMessage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem("room-toast");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // ✅ 2. If a message exists on mount, clear it from storage and set a timer.
    if (message) {
      try {
        sessionStorage.removeItem("room-toast");
      } catch {}

      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 z-200 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#2A2622] px-5 py-3 text-sm font-medium text-[#FAF9F6] shadow-2xl border border-white/10"
        >
          <Info className="h-4 w-4 text-[#9B9691]" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}