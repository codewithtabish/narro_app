// src/app/(loged)/app/calls/active/[callId]/loading.tsx
import { CallRoomSkeleton } from "@/components/site/pages/community/calling/call-room-skeleton";

/* -------------------------------------------------------------------------- */
/*  Loading — instant shell while the page streams                             */
/* -------------------------------------------------------------------------- */
/**
 * Next.js automatically shows this file while the page's async
 * components are loading. We reuse <CallRoomSkeleton /> so the user
 * sees the exact shape of the call room during the load.
 */
export default function ActiveCallLoading() {
  return <CallRoomSkeleton />;
}