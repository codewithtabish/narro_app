// src/components/site/pages/rooms/room-sound-listener.tsx
"use client";

import { useRoomSound } from "@/hooks/use-room-sound";

export function RoomSoundListener() {
  useRoomSound();
  return null;
}