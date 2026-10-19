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
  initialRole: "host" | "speaker" | "listener";
  pendingRequests: { id: string; userId: string; name: string; avatarUrl: string | null }[];
  myPendingRequestId: string | null;
}

export function RoomWrapper(props: RoomWrapperProps) {
  return (
    <Suspense fallback={<RoomLoadingSkeleton />}>
      <RoomAudioUI {...props} />
    </Suspense>
  );
}