// src/hooks/use-speaker-requests.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Lightweight polling hook for the Host's Waiting Room.
 * Refreshes the Server Component every 3 seconds to check for new speaker requests.
 * Because the data is cached with `cacheLife("max")`, this fetch is extremely fast.
 */
export function useSpeakerRequests(isHost: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!isHost) return;

    // Refresh the page data every 3 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [isHost, router]);
}