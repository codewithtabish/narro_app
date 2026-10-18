// src/components/site/loged/general/client-only.tsx
"use client";

import { useSyncExternalStore } from "react";

/* -------------------------------------------------------------------------- */
/*  ClientOnly                                                                 */
/* -------------------------------------------------------------------------- */
/**
 * Renders `children` only after hydration (client-side).
 *
 * Uses `useSyncExternalStore` — no useEffect, no setState, no warnings.
 * The server snapshot is always `false`; the client snapshot is always
 * `true`. React handles the switch automatically after hydration.
 *
 * Use this to wrap client-only UI that reads browser APIs
 * (localStorage, Notification, navigator, etc.) so it doesn't cause
 * SSR/CSR hydration mismatches.
 *
 * @example
 * <ClientOnly>
 *   <EnablePushBanner />
 * </ClientOnly>
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(
    () => () => {}, // subscribe — no-op
    () => true,     // client snapshot → true
    () => false,    // server snapshot → false
  );

  if (!isClient) return null;
  return <>{children}</>;
}