// src/hooks/use-speaker-requests.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useSpeakerRequests(isHost: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!isHost) return;

    // ✅ Refresh the server component every 3 seconds to fetch new requests
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [isHost, router]);
}