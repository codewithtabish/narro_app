// src/hooks/use-room-sound.ts
"use client";

import { useEffect } from "react";

export function useRoomSound() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "ROOM_INVITE_RECEIVED") return;

      try {
        const audio = new Audio(data.sound || "/sound/notification.mp3");
        audio.volume = 0.6;
        audio.play().catch((err) => {
          console.warn("[RoomSound] Autoplay blocked by browser:", err);
        });
      } catch (err) {
        console.error("[RoomSound] Failed to play sound:", err);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);
}