// src/components/site/pages/rooms/room-wrapper.tsx
import { Suspense } from "react";
import { RoomAudioUI } from "./room-audio-ui";
import { RoomLoadingSkeleton } from "./room-loading-skeleton";

interface RoomWrapperProps {
  token: string;
  serverUrl: string;
  roomId: string;
  roomTitle: string;
  isHost: boolean;
}

export function RoomWrapper(props: RoomWrapperProps) {
  return (
    <Suspense fallback={<RoomLoadingSkeleton />}>
      <RoomAudioUI {...props} />
    </Suspense>
  );
}