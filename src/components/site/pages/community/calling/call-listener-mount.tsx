// src/components/site/loged/active/calls/call-listener-mount.tsx
"use client";

import { usePathname } from "next/navigation";

import { IncomingCallListener } from "./incoming-call-listener";

/* -------------------------------------------------------------------------- */
/*  CallListenerMount                                                          */
/* -------------------------------------------------------------------------- */
/**
 * Wrapper that mounts <IncomingCallListener /> only when the user is NOT
 * inside the active call room.
 *
 * The key={pathname} forces React to unmount and remount the listener
 * on every route change. This guarantees a fresh state each time —
 * no stale ringtone, no stale modal.
 */
export function CallListenerMount() {
  const pathname = usePathname();
  const isOnCallPage = pathname?.startsWith("/app/calls/active/") ?? false;

  if (isOnCallPage) return null;

  return <IncomingCallListener key={pathname} />;
}