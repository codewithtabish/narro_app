// src/components/site/loged/active/calls/incoming-call-listener.tsx
"use client";

import { Loader2, Phone, PhoneOff } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { acceptCallAction } from "@/app/actions/calls/accept-call-action";
import { getIncomingCall } from "@/app/actions/calls/get-incoming-call";
import { rejectCallAction } from "@/app/actions/calls/reject-call-action";
import { useRingtone } from "@/hooks/use-ringtone";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface IncomingCallUI {
  callId: string;
  callerId: string | null;
  callerName: string;
  callerAvatar: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function dismissCallNotification(callId: string) {
  if (typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    const notifications = await reg.getNotifications();
    for (const n of notifications) {
      const nData = n.data || {};
      if (nData.type === "INCOMING_CALL" && nData.callId === callId) {
        n.close();
      }
    }
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/*  IncomingCallListener — SW-driven, zero polling                            */
/* -------------------------------------------------------------------------- */

export function IncomingCallListener() {
  const router = useRouter();
  const pathname = usePathname();
  const [incoming, setIncoming] = useState<IncomingCallUI | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigatingRef = useRef(false);

  const isOnCallPage = pathname?.startsWith("/community/active/") ?? false;

  /* ── One-time check on mount ──────────────────────────── */
  useEffect(() => {
    if (isOnCallPage) return;
    if (navigatingRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await getIncomingCall();
        if (cancelled) return;
        if (result.success && result.call) {
          setIncoming({
            callId: result.call.callId,
            callerId: result.call.caller.id,
            callerName: result.call.caller.name,
            callerAvatar:
              result.call.caller.profileImageUrl ??
              result.call.caller.imageUrl,
          });
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOnCallPage]);

  /* ── Protect against closing tab while ringing ────────── */
  // ✅ ADDED: This shows the "Leave site?" dialog if the receiver
  // tries to close the tab while the incoming call modal is open.
  useEffect(() => {
    if (!incoming) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (navigatingRef.current) return;
      e.preventDefault();
      e.returnValue = "You have an incoming call. Are you sure you want to leave?";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [incoming]);

  /* ── Ringtone ─────────────────────────────────────────── */
  useRingtone({
    src: "/sound/incoming-ring.mp3",
    enabled: !!incoming && !isOnCallPage,
    volume: 0.7,
    loop: true,
    vibrate: true,
  });

  /* ── SW messages — the only source of truth ───────────── */
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      /* New call */
      if (data.type === "INCOMING_CALL" && typeof data.callId === "string") {
        if (isOnCallPage) return;
        if (navigatingRef.current) return;
        setIncoming({
          callId: data.callId,
          callerId: data.callerId || null,
          callerName: data.callerName || "Someone",
          callerAvatar: data.callerAvatar || null,
        });
        return;
      }

      /* Silent push: caller cancelled → dismiss the modal INSTANTLY */
      if (data.type === "CALL_ENDED" && typeof data.callId === "string") {
        setIncoming((prev) =>
          prev && prev.callId === data.callId ? null : prev,
        );
        return;
      }

      /* User tapped Accept on OS notification */
      if (data.type === "ACCEPT_CALL" && typeof data.callId === "string") {
        if (navigatingRef.current) return;
        navigatingRef.current = true;
        setIncoming(null);
        router.push(`/community/active/${data.callId}`);
        return;
      }

      /* User tapped Decline on OS notification */
      if (data.type === "DECLINE_CALL" && typeof data.callId === "string") {
        void rejectCallAction(data.callId);
        setIncoming(null);
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [router, isOnCallPage]);

  /* ── Accept ───────────────────────────────────────────── */
  const handleAccept = useCallback(async () => {
    if (!incoming || isAccepting || navigatingRef.current) return;
    navigatingRef.current = true;
    setIsAccepting(true);
    setError(null);

    const callId = incoming.callId;
    void dismissCallNotification(callId);
    setIncoming(null);

    const result = await acceptCallAction(callId);

    if (!result.success) {
      setError(String(result.error));
      setIsAccepting(false);
      navigatingRef.current = false;
      return;
    }

    router.push(`/community/active/${callId}`);
  }, [incoming, isAccepting, router]);

  /* ── Reject ───────────────────────────────────────────── */
  const handleReject = useCallback(async () => {
    if (!incoming || isRejecting) return;
    setIsRejecting(true);
    setError(null);

    const callId = incoming.callId;
    void dismissCallNotification(callId);
    setIncoming(null);

    const result = await rejectCallAction(callId);

    if (!result.success) {
      setError(String(result.error));
      setIsRejecting(false);
      return;
    }

    setIsRejecting(false);
  }, [incoming, isRejecting]);

  /* ── Render guards ────────────────────────────────────── */
  if (isOnCallPage) return null;
  if (!incoming) return null;

  const avatar = incoming.callerAvatar;
  const initial = incoming.callerName?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Incoming call from ${incoming.callerName}`}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-8 bg-[#1a1613]/95 px-6 backdrop-blur-md"
    >
      <div className="relative flex h-32 w-32 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#805039]/40" />
        <span className="absolute inset-[-12px] animate-pulse rounded-full bg-[#805039]/20" />
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 shadow-2xl">
          {avatar ? (
            <Image
              src={avatar}
              alt={incoming.callerName}
              fill
              sizes="128px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#e9d9c9] font-serif text-4xl text-[#805039]">
              {initial}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-white">
          {incoming.callerName}
        </h1>
        <p className="flex items-center gap-2 text-sm text-white/70">
          <span>Incoming call</span>
          <span aria-hidden="true" className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80" />
          </span>
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-600/90 px-4 py-2 text-sm font-medium text-white">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-8">
        <button
          type="button"
          onClick={handleReject}
          disabled={isRejecting || isAccepting}
          aria-label="Decline call"
          className={cn(
            "inline-flex h-16 w-16 items-center justify-center rounded-full",
            "bg-red-600 text-white shadow-lg",
            "transition-all duration-200 hover:bg-red-700 active:scale-95",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/40",
          )}
        >
          {isRejecting ? (
            <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2.25} />
          ) : (
            <PhoneOff className="h-6 w-6" strokeWidth={2.25} />
          )}
        </button>

        <button
          type="button"
          onClick={handleAccept}
          disabled={isAccepting || isRejecting}
          aria-label="Accept call"
          className={cn(
            "inline-flex h-16 w-16 items-center justify-center rounded-full",
            "bg-emerald-500 text-white shadow-lg",
            "transition-all duration-200 hover:bg-emerald-600 active:scale-95",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40",
          )}
        >
          {isAccepting ? (
            <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2.25} />
          ) : (
            <Phone className="h-6 w-6" strokeWidth={2.25} />
          )}
        </button>
      </div>
    </div>
  );
}