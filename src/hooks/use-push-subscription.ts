// src/hooks/use-push-subscription.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { subscribePush } from "@/app/actions/push/subscribe-push";
import { unsubscribePush } from "@/app/actions/push/unsubscribe-push";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export interface UsePushSubscriptionResult {
  permission: PushPermission;
  isSubscribed: boolean;
  isWorking: boolean;
  error: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Convert a URL-safe base64 VAPID public key into an ArrayBuffer.
 */
function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }

  return buffer;
}

function getInitialPermission(): PushPermission {
  if (typeof window === "undefined") return "default";
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }
  return Notification.permission as PushPermission;
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    // ✅ CHANGED: Register the new /service-worker.js
    const reg = await navigator.serviceWorker.register("/service-worker.js", {
      scope: "/",
    });
    
    // ✅ Force update to bypass Chrome cache
    await reg.update();
    await navigator.serviceWorker.ready;
    
    return reg;
  } catch (err) {
    console.error("[use-push-subscription] SW registration failed:", err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  usePushSubscription                                                        */
/* -------------------------------------------------------------------------- */

export function usePushSubscription(): UsePushSubscriptionResult {
  const [permission, setPermission] = useState<PushPermission>(
    getInitialPermission,
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  /* ── On mount: check whether a subscription already exists ─ */
  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      try {
        if (
          typeof window === "undefined" ||
          !("serviceWorker" in navigator) ||
          !("PushManager" in window)
        ) {
          return;
        }

        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;

        const sub = await reg.pushManager.getSubscription();
        if (mountedRef.current && sub) {
          setIsSubscribed(true);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ── enable() ──────────────────────────────────────────── */
  const enable = useCallback(async () => {
    setIsWorking(true);
    setError(null);

    try {
      /* 1. Feature check */
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        throw new Error(
          "Push notifications are not supported in this browser.",
        );
      }

      /* 2. Ask permission */
      const perm = await Notification.requestPermission();
      if (mountedRef.current) setPermission(perm as PushPermission);
      if (perm !== "granted") {
        throw new Error("Permission denied.");
      }

      /* 3. Register service worker */
      const reg = await registerServiceWorker();
      if (!reg) throw new Error("Service worker failed to register.");

      /* 4. Subscribe to push */
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Missing VAPID public key.");

      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToArrayBuffer(publicKey),
        }));

      /* 5. Save to server via Server Action */
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Invalid subscription format.");
      }

      const result = await subscribePush({
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      if (mountedRef.current) setIsSubscribed(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to enable push.";
      if (mountedRef.current) setError(msg);
      console.error("[use-push-subscription] enable failed:", err);
    } finally {
      if (mountedRef.current) setIsWorking(false);
    }
  }, []);

  /* ── disable() ─────────────────────────────────────────── */
  const disable = useCallback(async () => {
    setIsWorking(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        if (mountedRef.current) setIsSubscribed(false);
        return;
      }

      /* 1. Remove from server via Server Action */
      const result = await unsubscribePush({ endpoint: sub.endpoint });
      if (!result.success) {
        throw new Error(result.error);
      }

      /* 2. Remove from browser */
      await sub.unsubscribe();

      if (mountedRef.current) setIsSubscribed(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to disable push.";
      if (mountedRef.current) setError(msg);
    } finally {
      if (mountedRef.current) setIsWorking(false);
    }
  }, []);

  return {
    permission,
    isSubscribed,
    isWorking,
    error,
    enable,
    disable,
  };
}