// src/components/site/loged/active/calls/call-room.tsx
"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { RoomEvent } from "livekit-client";
import {
  ChevronDown,
  Loader2,
  Mic,
  MicOff,
  MoreHorizontal,
  PhoneOff,
  Volume2,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { endCall } from "@/app/actions/calls/end-call-action";
import { getCallToken } from "@/app/actions/calls/get-call-token";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CallRoomProps {
  callId: string;
}

type RoomData = {
  token: string;
  liveKitUrl: string;
  roomName: string;
  isCaller: boolean;
  otherParticipant: {
    name: string;
    imageUrl: string | null;
    profileImageUrl: string | null;
  };
};

/* -------------------------------------------------------------------------- */
/*  CallRoom                                                                   */
/* -------------------------------------------------------------------------- */

export function CallRoom({ callId }: CallRoomProps) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await getCallToken({ callId });
      if (cancelled) return;

      if (!result.success) {
        setError(result.error);
        return;
      }

      setRoomData({
        token: result.token,
        liveKitUrl: result.liveKitUrl,
        roomName: result.roomName,
        isCaller: result.isCaller,
        otherParticipant: result.otherParticipant,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [callId]);

  if (error) return <CallRoomError message={error} />;
  if (!roomData) return <CallRoomLoading />;

  return (
    <LiveKitRoom
      token={roomData.token}
      serverUrl={roomData.liveKitUrl}
      connect={true}
      audio={true}
      video={false}
      className="contents"
    >
      <RoomAudioRenderer />
      <CallRoomUI
        callId={callId}
        otherParticipant={roomData.otherParticipant}
      />
    </LiveKitRoom>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading / Error                                                            */
/* -------------------------------------------------------------------------- */

function CallRoomLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Connecting to call…</p>
      </div>
    </div>
  );
}

function CallRoomError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <div className="max-w-md text-center text-foreground">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20 text-destructive">
          <PhoneOff size={22} />
        </div>
        <h2 className="mt-5 font-serif text-2xl">Call unavailable</h2>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        <a
          href="/community"
          className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Back to community
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CallRoomUI                                                                 */
/* -------------------------------------------------------------------------- */

function CallRoomUI({
  callId,
  otherParticipant,
}: {
  callId: string;
  otherParticipant: RoomData["otherParticipant"];
}) {
  const router = useRouter();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endedByOther, setEndedByOther] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  
  // ✅ State for internet drops
  const [isReconnecting, setIsReconnecting] = useState(false);

  const leavingRef = useRef(false);

  const avatar =
    otherParticipant.profileImageUrl ?? otherParticipant.imageUrl ?? null;
  const initial = otherParticipant.name?.[0]?.toUpperCase() ?? "?";

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const unlockedRef = useRef(false);
  useEffect(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    if (localParticipant) {
      void localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant]);

  useEffect(() => {
    if (!room) return;

    function handleParticipantDisconnected() {
      if (leavingRef.current) return;
      leavingRef.current = true;
      setEndedByOther(true);

      setTimeout(async () => {
        try { await endCall({ callId }); } catch {}
        try { await room.disconnect(); } catch {}
        router.push("/community");
      }, 1500);
    }

    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    return () => {
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, callId, router]);

  /* ── Listen for internet drops (Reconnecting / Reconnected) ── */
  useEffect(() => {
    if (!room) return;

    function handleReconnecting() {
      setIsReconnecting(true);
    }

    function handleReconnected() {
      setIsReconnecting(false);
    }

    room.on(RoomEvent.Reconnecting, handleReconnecting);
    room.on(RoomEvent.Reconnected, handleReconnected);

    return () => {
      room.off(RoomEvent.Reconnecting, handleReconnecting);
      room.off(RoomEvent.Reconnected, handleReconnected);
    };
  }, [room]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (leavingRef.current || endedByOther) return;
      e.preventDefault();
      e.returnValue = "You have an active call. Are you sure you want to leave?";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [endedByOther]);

  async function toggleMute() {
    if (!localParticipant) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    await localParticipant.setMicrophoneEnabled(!newMuted);
  }

  async function executeEndCall() {
    if (isEnding || leavingRef.current) return;
    leavingRef.current = true;
    setIsEnding(true);
    try { await endCall({ callId }); } catch {}
    try { await room.disconnect(); } catch {}
    router.push("/community");
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-background">
      
      {/* Background Gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 45%, var(--primary) 0%, transparent 60%)",
          opacity: 0.15,
        }}
      />

      {/* 🚨 Internet Drop Overlay */}
      {isReconnecting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
            <WifiOff size={32} className="animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl text-foreground">Connection lost</h2>
          <p className="text-sm text-muted-foreground">Trying to reconnect…</p>
        </div>
      )}

      {/* Top Bar */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 pt-6 sm:px-8">
        <span className="font-serif text-[22px] tracking-[-0.02em] text-foreground">
          NARRO
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-1.5 text-[13px] font-medium text-foreground backdrop-blur-sm">
          <span className={cn("h-2 w-2 animate-pulse rounded-full", endedByOther ? "bg-red-500" : isReconnecting ? "bg-amber-500" : "bg-emerald-500")} />
          {endedByOther ? "Call ended" : isReconnecting ? "Reconnecting" : "In call"}
        </span>
        <div className="flex items-center gap-3 text-muted-foreground">
          <button onClick={() => setShowLeaveDialog(true)} aria-label="Minimize" className="rounded-full p-2 transition hover:bg-muted">
            <ChevronDown size={20} />
          </button>
          <button aria-label="More options" className="rounded-full p-2 transition hover:bg-muted">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* Center Stage */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="relative flex h-[200px] w-[200px] items-center justify-center sm:h-[240px] sm:w-[240px]">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <span className="absolute inset-4 animate-pulse rounded-full bg-primary/30" />
          <div className="relative h-[160px] w-[160px] overflow-hidden rounded-full border-4 border-background shadow-xl sm:h-[180px] sm:w-[180px]">
            {avatar ? (
              <Image src={avatar} alt={otherParticipant.name} fill sizes="180px" unoptimized className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-muted font-serif text-5xl text-primary">{initial}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] text-foreground sm:text-[44px]">{otherParticipant.name}</h1>
          <p className="font-mono text-[24px] font-medium text-foreground/80 tabular-nums">{formatTime(elapsedSeconds)}</p>
        </div>

        {!endedByOther && (
          <div aria-hidden="true" className="mt-4 flex items-end gap-1.5 text-primary">
            {[12, 24, 36, 16, 28, 20, 32, 14, 22].map((h, i) => (
              <span key={i} className="w-[3px] animate-pulse rounded-full bg-current" style={{ height: `${h}px`, animationDelay: `${i * 100}ms`, animationDuration: "800ms" }} />
            ))}
          </div>
        )}

        {endedByOther && (
          <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-destructive">Call ended</p>
        )}
      </main>

      {/* Bottom Control Dock */}
      <footer className="relative z-10 mb-10 flex w-full flex-col items-center gap-4 px-4">
        <div className="flex w-full max-w-[360px] items-center justify-between rounded-[40px] border border-border bg-background/60 px-6 py-4 shadow-lg backdrop-blur-md">
          <div className="flex flex-col items-center gap-1.5">
            <button onClick={toggleMute} disabled={endedByOther || isReconnecting} className={cn("flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-200 hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-50", isMuted && "bg-muted text-muted-foreground")}>
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <span className="text-[11px] font-medium text-muted-foreground">Mute</span>
          </div>

          <button onClick={() => setShowLeaveDialog(true)} disabled={isEnding || endedByOther} className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_32px_-4px_rgba(220,38,38,0.6)] transition-all duration-200 hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
            {isEnding ? <Loader2 className="h-7 w-7 animate-spin" /> : <PhoneOff size={28} />}
          </button>

          <div className="flex flex-col items-center gap-1.5">
            <button disabled={endedByOther || isReconnecting} className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-200 hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
              <Volume2 size={22} />
            </button>
            <span className="text-[11px] font-medium text-muted-foreground">Speaker</span>
          </div>
        </div>
        <p className="text-[11px] italic text-muted-foreground/60">Your voice is encrypted end-to-end.</p>
      </footer>

      {/* Leave Dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLeaveDialog(false)} />
          <div className="relative w-full max-w-[400px] rounded-[32px] bg-background p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500">
              <PhoneOff size={28} />
            </div>
            <h2 className="mt-6 font-serif text-[28px] text-foreground">End this call?</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              If you leave now, your conversation with {otherParticipant.name} will end immediately for both of you.
            </p>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowLeaveDialog(false)} className="flex-1 rounded-full bg-[#6B4A3A] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#5a3f31] active:scale-[0.98]">Stay in call</button>
              <button onClick={executeEndCall} className="flex-1 rounded-full border border-red-600 py-3.5 text-[15px] font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-[0.98]">Leave call</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}