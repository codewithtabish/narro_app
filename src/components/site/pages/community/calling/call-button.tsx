// src/components/site/loged/single-call/call-button.tsx
"use client";

import { Loader2, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAutoMissed } from "@/hooks/use-auto-missed";
import { useRingtone } from "@/hooks/use-ringtone";
import { cn } from "@/lib/utils";

import { cancelCall } from "@/app/actions/calls/cancel-call-action";
import { ringingCall } from "@/app/actions/calls/ringing-call-action";
import { RingingCard } from "./ringing-card";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------ri------------------------------------- */

const POLL_INTERVAL_MS = 2_000;
const CALL_STORAGE_KEY = "narro:active-outgoing-call";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CallButtonProps {
  receiverId: string;
  receiverClerkId: string;
  receiverName: string;
  receiverAvatar?: string | null;
  className?: string;
}

type CallState =
  | { kind: "IDLE" }
  | { kind: "CONNECTING" }
  | { kind: "RINGING"; callId: string }
  | { kind: "ENDING"; callId: string };

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function saveActiveCall(receiverId: string, callId: string) {
  try {
    sessionStorage.setItem(
      CALL_STORAGE_KEY,
      JSON.stringify({ receiverId, callId, startedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

function clearActiveCall() {
  try {
    sessionStorage.removeItem(CALL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function readActiveCall(): { receiverId: string; callId: string } | null {
  try {
    const raw = sessionStorage.getItem(CALL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.receiverId === "string" &&
      typeof parsed?.callId === "string"
    ) {
      return { receiverId: parsed.receiverId, callId: parsed.callId };
    }
    return null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  CallButton                                                                 */
/* -------------------------------------------------------------------------- */

export function CallButton({
  receiverId,
  receiverClerkId,
  receiverName,
  receiverAvatar,
  className,
}: CallButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<CallState>({ kind: "IDLE" });
  const [error, setError] = useState<string | null>(null);
  const navigatedRef = useRef(false);
  const mountedRef = useRef(true);

  /* ── Restore active call from sessionStorage on mount ──── */
  useEffect(() => {
    mountedRef.current = true;

    const saved = readActiveCall();
    if (!saved) {
      if (mountedRef.current) setState({ kind: "IDLE" });
      return;
    }

    if (saved.receiverId !== receiverId) {
      clearActiveCall();
      if (mountedRef.current) setState({ kind: "IDLE" });
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/calls/get?callId=${saved.callId}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (!mountedRef.current) return;

        if (data?.success && data.call?.status === "RINGING") {
          setState({ kind: "RINGING", callId: saved.callId });
        } else if (data?.success && data.call?.status === "ACCEPTED") {
          // ✅ CHANGED: Go to /community/active
          router.push(`/community/active/${saved.callId}`);
        } else {
          clearActiveCall();
          setState({ kind: "IDLE" });
        }
      } catch {
        clearActiveCall();
        if (mountedRef.current) setState({ kind: "IDLE" });
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [receiverId, router]);

  /* ── Auto-clear errors ─────────────────────────────────── */
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  /* ── Start the call ────────────────────────────────────── */
  const handleCall = useCallback(async () => {
    if (state.kind !== "IDLE") return;
    setState({ kind: "CONNECTING" });
    setError(null);
    navigatedRef.current = false;

    const result = await ringingCall({ receiverId });

    if (!result.success) {
      setError(result.error);
      setState({ kind: "IDLE" });
      return;
    }

    saveActiveCall(receiverId, result.callId);
    setState({ kind: "RINGING", callId: result.callId });
  }, [receiverId, state.kind]);

  /* ── Cancel while ringing ──────────────────────────────── */
  const handleCancel = useCallback(async () => {
    if (state.kind !== "RINGING") return;

    const callId = state.callId;
    setState({ kind: "ENDING", callId });

    const result = await cancelCall({ callId });

    if (!result.success) {
      setError(result.error);
      setState({ kind: "RINGING", callId });
      return;
    }

    clearActiveCall();
    setState({ kind: "IDLE" });
  }, [state]);

  /* ── Layer 1 — 40s auto-miss ───────────────────────────── */
  useAutoMissed(
    state.kind === "RINGING" ? state.callId : "",
    state.kind === "RINGING",
  );

  /* ── Outgoing ringtone ─────────────────────────────────── */
  useRingtone({
    src: "/sound/outgoing-ring.mp3",
    enabled: state.kind === "RINGING",
    volume: 0.5,
    loop: true,
    vibrate: false,
  });

  /* ── Poll for status change while ringing ──────────────── */
  useEffect(() => {
    if (state.kind !== "RINGING") return;
    if (navigatedRef.current) return;

    const callId = state.callId;
    const firstName = receiverName.split(" ")[0];
    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/calls/get?callId=${callId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        if (cancelled) return;
        if (!data?.success || !data.call) return;

        const status = data.call.status as string;

        /* Receiver accepted → go to room */
        if (status === "ACCEPTED") {
          if (navigatedRef.current) return;
          navigatedRef.current = true;
          // ✅ CHANGED: Go to /community/active
          router.push(`/community/active/${callId}`);
          return;
        }

        /* Terminal states → reset */
        if (
          status === "REJECTED" ||
          status === "MISSED" ||
          status === "CANCELLED" ||
          status === "ENDED"
        ) {
          clearActiveCall();
          setState({ kind: "IDLE" });

          if (status === "REJECTED") {
            setError(`${firstName} declined`);
          } else if (status === "MISSED") {
            setError("No answer");
          }
        }
      } catch {
        /* ignore */
      }
    }

    void checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [state, receiverName, router]);

  /* ── Derived ───────────────────────────────────────────── */
  const firstName = receiverName.split(" ")[0];

  /* ── RINGING / ENDING — RingingCard ────────────────────── */
  if (state.kind === "RINGING" || state.kind === "ENDING") {
    return (
      <>
        <RingingCard
          receiverName={receiverName}
          receiverAvatar={receiverAvatar}
          isEnding={state.kind === "ENDING"}
          onCancel={handleCancel}
        />
        {error && <ErrorToast message={error} />}
      </>
    );
  }

  /* ── IDLE / CONNECTING button ──────────────────────────── */
  const isConnecting = state.kind === "CONNECTING";

  return (
    <>
      <button
        type="button"
        onClick={handleCall}
        disabled={isConnecting}
        aria-label={`Call ${receiverName}`}
        data-receiver-clerk-id={receiverClerkId}
        className={cn(
          "flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full",
          "bg-[#805039] px-4 text-sm font-semibold text-white",
          "transition-all duration-200",
          "hover:bg-[#6e432f]",
          "active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#805039]/40",
          className,
        )}
      >
        {isConnecting ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            Calling…
          </>
        ) : (
          <>
            <Phone size={19} fill="currentColor" />
            Call {firstName}
          </>
        )}
      </button>

      {error && <ErrorToast message={error} />}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  ErrorToast                                                                 */
/* -------------------------------------------------------------------------- */

function ErrorToast({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      {message}
    </div>
  );
}