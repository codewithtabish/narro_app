// src/components/site/pages/live-stream/stream-room.tsx
"use client";

import {
    DisconnectReason,
    Room,
    RoomEvent,
    Track,
    type RemoteParticipant,
    type RemoteTrack,
    type RemoteTrackPublication,
} from "livekit-client";
import {
    Camera,
    CameraOff,
    Eye,
    Gift as GiftIcon,
    Heart,
    Loader2,
    LogOut,
    Maximize2,
    MessageCircle,
    Mic,
    MicOff,
    Power,
    Radio,
    SendHorizontal,
    Volume2,
    VolumeX,
    WifiOff,
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
    type FormEvent,
} from "react";

import { endLiveStream } from "@/app/actions/livestream/end-stream";
import { sendChatMessage } from "@/app/actions/livestream/send-chat-message";
import { sendReaction } from "@/app/actions/livestream/send-reaction";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { type Gift } from "@/data/gifts";
import {
    isChatPayload,
    isGiftPayload,
    isReactionPayload,
    LIVE_TOPICS,
    MAX_CHAT_LENGTH,
    type ChatEventPayload,
    type GiftEventPayload,
} from "@/lib/livestream/live-stream-events";
import { ConfirmDialog } from "./confirm-dialog";
import { GiftModal } from "./gift-modal";

type RoomStatus = "connecting" | "live" | "reconnecting" | "ended" | "error";

type FeedItem =
  | ({ kind: "chat" } & ChatEventPayload)
  | ({ kind: "gift" } & GiftEventPayload);

interface FloatingHeart {
  id: number;
  offset: number;
}

interface StreamRoomProps {
  streamId: string;
  title: string;
  hostId: string;
  hostName: string;
  hostImage: string | null;
  hostFollowers: number;
  currentUserId: string;
  token: string;
  liveKitUrl: string;
  isHost: boolean;
  initialBalance: number;
}

const MAX_FEED = 100;
const GIFT_OVERLAY_MS = 3500;
const HEART_LIFETIME_MS = 2200;
const MAX_HEARTS = 30;

const KEYFRAMES = `
@keyframes narro-float {
  0%   { transform: translateY(0) scale(.6); opacity: 1; }
  100% { transform: translateY(-220px) scale(1.25); opacity: 0; }
}
.narro-float { animation: narro-float ${HEART_LIFETIME_MS}ms ease-out forwards; }
@media (prefers-reduced-motion: reduce) { .narro-float { animation: none; opacity: 0; } }
`;

function formatTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function StreamRoom({
  streamId,
  title,
  hostId,
  hostName,
  hostImage,
  hostFollowers,
  currentUserId,
  token,
  liveKitUrl,
  isHost,
  initialBalance,
}: StreamRoomProps) {
  const router = useRouter();

  /* ── refs ── */
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioHostRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const audioElsRef = useRef<Map<string, HTMLMediaElement>>(new Map());
  const listenMutedRef = useRef(false);
  const seenIds = useRef<Set<string>>(new Set());
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const heartSeq = useRef(0);
  const pendingTaps = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const stickToBottom = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendLock = useRef(false);

  /* ── state ── */
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const [hostOnline, setHostOnline] = useState(isHost);
  const [canPlayAudio, setCanPlayAudio] = useState(true);
  const [listenMuted, setListenMuted] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [overlay, setOverlay] = useState<GiftEventPayload | null>(null);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [balance, setBalance] = useState(initialBalance);
  const [giftOpen, setGiftOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatText, setChatText] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [sendingChat, setSendingChat] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEnding, startEnding] = useTransition();

  /* ───────────────────────── helpers ───────────────────────── */
  const spawnHearts = useCallback((n: number) => {
    const batch: FloatingHeart[] = [];
    for (let i = 0; i < Math.min(n, 5); i += 1) {
      heartSeq.current += 1;
      batch.push({ id: heartSeq.current, offset: Math.round(Math.random() * 44) });
    }
    setHearts((prev) => [...prev, ...batch].slice(-MAX_HEARTS));

    const t = setTimeout(() => {
      heartTimers.current.delete(t);
      setHearts((prev) => prev.filter((h) => !batch.some((b) => b.id === h.id)));
    }, HEART_LIFETIME_MS);
    heartTimers.current.add(t);
  }, []);

  /* ───────────────────────── LiveKit connection ───────────────────────── */
  useEffect(() => {
    let cancelled = false;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;
    const audioEls = audioElsRef.current;
    const heartTimerSet = heartTimers.current;

    const updateCount = () => {
      let others = 0;
      room.remoteParticipants.forEach((p) => {
        if (p.identity !== hostId) others += 1;
      });
      setViewerCount(others + (isHost ? 0 : 1));
      setHostOnline(isHost || room.remoteParticipants.has(hostId));
    };

    const attachHostVideo = () => {
      const el = videoRef.current;
      if (!el) return;
      const pub = isHost
        ? room.localParticipant.getTrackPublication(Track.Source.Camera)
        : room.remoteParticipants.get(hostId)?.getTrackPublication(Track.Source.Camera);
      const track = pub?.track;
      if (track && track.kind === Track.Kind.Video) {
        track.attach(el);
        setHasVideo(!pub?.isMuted);
      } else {
        setHasVideo(false);
      }
    };

    const onTrackSubscribed = (
      track: RemoteTrack,
      pub: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      if (participant.identity !== hostId) return;
      if (track.kind === Track.Kind.Video) {
        attachHostVideo();
      } else if (track.kind === Track.Kind.Audio) {
        const el = track.attach();
        el.style.display = "none";
        el.muted = listenMutedRef.current;
        audioHostRef.current?.appendChild(el);
        audioEls.set(pub.trackSid, el);
      }
    };

    const onTrackUnsubscribed = (track: RemoteTrack, pub: RemoteTrackPublication) => {
      track.detach().forEach((el) => el.remove());
      audioEls.delete(pub.trackSid);
      if (track.kind === Track.Kind.Video) setHasVideo(false);
    };

    const onData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: string,
    ) => {
      // Only trust packets sent by the SERVER (they have no participant sender).
      if (participant || !topic) return;

      let data: unknown;
      try {
        data = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }

      if (topic === LIVE_TOPICS.chat && isChatPayload(data)) {
        if (seenIds.current.has(data.id)) return;
        seenIds.current.add(data.id);
        const item: FeedItem = { kind: "chat", ...data };
        setFeed((prev) => [...prev, item].slice(-MAX_FEED));
        return;
      }

      if (topic === LIVE_TOPICS.gift && isGiftPayload(data)) {
        if (seenIds.current.has(data.id)) return;
        seenIds.current.add(data.id);
        const item: FeedItem = { kind: "gift", ...data };
        setFeed((prev) => [...prev, item].slice(-MAX_FEED));
        setOverlay(data);
        if (overlayTimer.current) clearTimeout(overlayTimer.current);
        overlayTimer.current = setTimeout(() => setOverlay(null), GIFT_OVERLAY_MS);
        return;
      }

      if (topic === LIVE_TOPICS.reaction && isReactionPayload(data)) {
        if (seenIds.current.has(data.id)) return;
        seenIds.current.add(data.id);
        // My own taps are already shown instantly on my screen.
        if (data.senderId !== currentUserId) spawnHearts(data.count);
      }
    };

    room
      .on(RoomEvent.TrackSubscribed, onTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
      .on(RoomEvent.LocalTrackPublished, attachHostVideo)
      .on(RoomEvent.TrackMuted, attachHostVideo)
      .on(RoomEvent.TrackUnmuted, attachHostVideo)
      .on(RoomEvent.ParticipantConnected, updateCount)
      .on(RoomEvent.ParticipantDisconnected, updateCount)
      .on(RoomEvent.DataReceived, onData)
      .on(RoomEvent.Reconnecting, () => setStatus("reconnecting"))
      .on(RoomEvent.Reconnected, () => {
        setStatus("live");
        updateCount();
        attachHostVideo();
      })
      .on(RoomEvent.AudioPlaybackStatusChanged, () => setCanPlayAudio(room.canPlaybackAudio))
      .on(RoomEvent.Disconnected, (reason) => {
        if (cancelled || reason === DisconnectReason.CLIENT_INITIATED) return;
        if (reason === DisconnectReason.ROOM_DELETED) {
          setConfirmOpen(false);
          setStatus("ended");
        } else {
          setErrorMsg("You were disconnected from the stream.");
          setStatus("error");
        }
      });

    (async () => {
      try {
        await room.connect(liveKitUrl, token);
        if (cancelled) {
          await room.disconnect();
          return;
        }

        if (isHost) {
          try {
            await room.localParticipant.setCameraEnabled(true);
            await room.localParticipant.setMicrophoneEnabled(true);
          } catch {
            if (!cancelled) {
              setErrorMsg("Camera or microphone access was blocked. Allow access and try again.");
              setStatus("error");
            }
            return;
          }
        }

        setStatus("live");
        setCanPlayAudio(room.canPlaybackAudio);
        updateCount();
        attachHostVideo();
      } catch {
        if (!cancelled) {
          setErrorMsg("Couldn't connect to the stream.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (overlayTimer.current) clearTimeout(overlayTimer.current);
      if (tapTimer.current) clearTimeout(tapTimer.current);
      heartTimerSet.forEach((t) => clearTimeout(t));
      heartTimerSet.clear();
      room.removeAllListeners();
      audioEls.forEach((el) => el.remove());
      audioEls.clear();
      void room.disconnect();
      roomRef.current = null;
    };
  }, [hostId, isHost, liveKitUrl, token, currentUserId, spawnHearts]);

  /* ── Apply "mute host audio" to every audio element ── */
  useEffect(() => {
    listenMutedRef.current = listenMuted;
    audioElsRef.current.forEach((el) => {
      el.muted = listenMuted;
    });
  }, [listenMuted]);

  /* ── Keep chat pinned to the newest message (unless user scrolled up) ── */
  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [feed, chatOpen]);

  /* ───────────────────────── actions ───────────────────────── */
  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micOn;
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
    } catch {
      /* keep previous state */
    }
  }, [micOn]);

  const toggleCam = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !camOn;
    try {
      await room.localParticipant.setCameraEnabled(next);
      setCamOn(next);
    } catch {
      /* keep previous state */
    }
  }, [camOn]);

  const enableAudio = useCallback(async () => {
    try {
      await roomRef.current?.startAudio();
      setCanPlayAudio(true);
    } catch {
      /* browser still blocking */
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* not supported */
    }
  }, []);

  const handleHeart = useCallback(() => {
    if (status !== "live") return;
    spawnHearts(1); // instant feedback on my screen
    pendingTaps.current += 1;
    if (tapTimer.current) return;

    // Batch rapid taps into one request every 600ms.
    tapTimer.current = setTimeout(() => {
      const count = Math.min(pendingTaps.current, 5);
      pendingTaps.current = 0;
      tapTimer.current = null;
      if (count > 0) void sendReaction({ streamId, count }).catch(() => {});
    }, 600);
  }, [spawnHearts, status, streamId]);

  const handleSendChat = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const text = chatText.trim();
      if (!text || sendLock.current || status !== "live") return;

      sendLock.current = true;
      setSendingChat(true);
      setChatError(null);
      setChatText("");

      try {
        const res = await sendChatMessage({ streamId, text });
        if (!res.success) {
          setChatError(res.error);
          setChatText(text); // give the text back so nothing is lost
        } else {
          stickToBottom.current = true;
        }
      } catch {
        setChatError("Message couldn't be sent. Try again.");
        setChatText(text);
      } finally {
        sendLock.current = false;
        setSendingChat(false);
        inputRef.current?.focus();
      }
    },
    [chatText, status, streamId],
  );

  /** X button / Close stream / Leave → ask first (skip the prompt if it already ended). */
  const requestClose = useCallback(() => {
    if (status === "ended") {
      router.replace("/live-stream");
      return;
    }
    setErrorMsg(null);
    setConfirmOpen(true);
  }, [router, status]);

  const cancelClose = useCallback(() => {
    if (!isEnding) setConfirmOpen(false);
  }, [isEnding]);

  /** Host → ends the stream for everyone. Viewer → just leaves. */
  const confirmClose = () => {
    if (!isHost) {
      setConfirmOpen(false);
      router.push("/live-stream");
      return;
    }

    startEnding(async () => {
      const res = await endLiveStream({ streamId });
      if (res.success) {
        // ✅ 1. Close the dialog
        setConfirmOpen(false);
        
        // ✅ 2. Redirect to the directory
        router.push("/live-stream");
        
        // ✅ 3. Force Next.js to drop the cached page and re-fetch fresh data
        router.refresh(); 
      } else {
        // ✅ FIXED: Fallback to null if res.error is undefined
        setErrorMsg(res.error ?? "Failed to end the stream.");
        setConfirmOpen(false);
      }
    });
  };

  const handleSent = useCallback((_gift: Gift, newBalance: number) => {
    setBalance(newBalance);
  }, []);

  const initial = useMemo(() => hostName.trim().charAt(0).toUpperCase() || "?", [hostName]);
  const chatDisabled = status !== "live";

  const dialogDescription = isHost
    ? viewerCount > 0
      ? `This ends the live stream for you and ${viewerCount} ${viewerCount === 1 ? "viewer" : "viewers"}. This can't be undone.`
      : "This ends your live stream. This can't be undone."
    : "You'll stop watching. You can rejoin anytime while the host is still live.";

  /* ───────────────────────── render ───────────────────────── */
  return (
    <section
      aria-label={`Live stream: ${title}`}
      className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_340px]"
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* ═════════════ LEFT: header + video + controls ═════════════ */}
      <div className="flex min-w-0 flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
            LIVE
          </span>
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h1>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground"
            aria-label={`${viewerCount} watching`}
          >
            <Eye className="size-4" aria-hidden="true" />
            {viewerCount.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={requestClose}
            aria-label={isHost ? "Close stream" : "Leave stream"}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Video */}
        <div
          ref={wrapRef}
          className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isHost}
            className={cn(
              "size-full object-cover",
              isHost && "-scale-x-100",
              !hasVideo && "invisible",
            )}
          />
          <div ref={audioHostRef} aria-hidden="true" />

          {/* Host chip */}
          <div className="absolute bottom-3 left-3 flex max-w-[70%] items-center gap-2 rounded-full bg-black/60 py-1 pl-1 pr-3 backdrop-blur-sm">
            {hostImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hostImage} alt="" className="size-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initial}
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-white">{hostName}</span>
                <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Host
                </span>
              </div>
              <span className="text-xs text-white/70">
                {hostFollowers.toLocaleString()} {hostFollowers === 1 ? "follower" : "followers"}
              </span>
            </div>
          </div>

          {/* Heart + fullscreen */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={handleHeart}
              disabled={status !== "live"}
              aria-label="Send a heart"
              className="flex size-10 items-center justify-center rounded-full bg-black/60 text-red-500 backdrop-blur-sm transition-transform active:scale-90 disabled:opacity-50"
            >
              <Heart className="size-5 fill-current" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
            >
              <Maximize2 className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* Floating hearts (from everyone) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {hearts.map((h) => (
              <Heart
                key={h.id}
                className="narro-float absolute bottom-16 size-7 fill-red-500 text-red-500"
                style={{ right: 16 + h.offset }}
              />
            ))}
          </div>

          {/* Gift pill (server-confirmed gifts only) */}
          {overlay && (
            <div
              key={overlay.id}
              role="status"
              className="pointer-events-none absolute inset-x-0 top-1/4 flex flex-col items-center gap-3 px-4 animate-in fade-in zoom-in-50 duration-300"
            >
              <span className="text-7xl drop-shadow-lg sm:text-8xl" aria-hidden="true">
                {overlay.emoji}
              </span>
              <span className="flex max-w-full items-center gap-2 rounded-full border border-primary/50 bg-black/75 py-1.5 pl-1.5 pr-4 text-sm text-white backdrop-blur-sm">
                {overlay.senderImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={overlay.senderImage} alt="" className="size-7 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {overlay.senderName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="truncate">
                  {overlay.senderName} sent a {overlay.giftName} to {hostName}!
                </span>
              </span>
            </div>
          )}

          {/* States */}
          {status === "connecting" && (
            <StateOverlay>
              <Loader2 className="size-6 animate-spin" aria-hidden="true" />
              <p>{isHost ? "Starting your stream…" : "Joining stream…"}</p>
            </StateOverlay>
          )}

          {status === "live" && !hasVideo && (
            <StateOverlay>
              <Radio className="size-6" aria-hidden="true" />
              <p>
                {isHost
                  ? "Your camera is off"
                  : hostOnline
                    ? "Host's camera is off"
                    : "Waiting for the host…"}
              </p>
            </StateOverlay>
          )}

          {status === "reconnecting" && (
            <StateOverlay>
              <WifiOff className="size-6" aria-hidden="true" />
              <p>Connection lost. Reconnecting…</p>
            </StateOverlay>
          )}

          {status === "error" && (
            <StateOverlay>
              <WifiOff className="size-6" aria-hidden="true" />
              <p>{errorMsg ?? "Something went wrong."}</p>
              <Button size="sm" onClick={() => router.refresh()}>
                Try again
              </Button>
            </StateOverlay>
          )}

          {status === "ended" && (
            <StateOverlay>
              <p className="text-lg font-semibold">This stream has ended</p>
              <Button asChild size="sm">
                <Link href="/live-stream">Back to live streams</Link>
              </Button>
            </StateOverlay>
          )}

          {!canPlayAudio && status === "live" && !isHost && (
            <button
              type="button"
              onClick={enableAudio}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              <Volume2 className="size-4" aria-hidden="true" />
              Tap to hear
            </button>
          )}
        </div>

        {/* Control bar */}
        <div className="mx-auto flex w-full max-w-xl items-stretch gap-2 rounded-2xl border border-border bg-card p-2">
          {isHost ? (
            <>
              <BarButton
                label={micOn ? "Mute" : "Unmute"}
                onClick={toggleMic}
                disabled={status !== "live"}
                icon={micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
              />
              <BarButton
                label={camOn ? "Camera off" : "Camera on"}
                onClick={toggleCam}
                disabled={status !== "live"}
                icon={camOn ? <Camera className="size-5" /> : <CameraOff className="size-5" />}
              />
              <Button
                type="button"
                variant="destructive"
                className="h-auto min-h-14 flex-1 gap-2 text-base"
                onClick={requestClose}
              >
                <Power className="size-5" aria-hidden="true" />
                Close stream
              </Button>
            </>
          ) : (
            <>
              <BarButton
                label={listenMuted ? "Unmute" : "Mute"}
                onClick={() => setListenMuted((m) => !m)}
                icon={listenMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              />
              <Button
                type="button"
                className="h-auto min-h-14 flex-1 gap-2 text-base"
                onClick={() => setGiftOpen(true)}
                disabled={status === "ended"}
              >
                <GiftIcon className="size-5" aria-hidden="true" />
                Send gift
              </Button>
              <BarButton
                label="Leave"
                onClick={requestClose}
                icon={<LogOut className="size-5" />}
              />
              <BarButton
                label="Chat"
                className="lg:hidden"
                onClick={() => setChatOpen((o) => !o)}
                pressed={chatOpen}
                icon={<MessageCircle className="size-5" />}
              />
            </>
          )}
        </div>

        {errorMsg && status !== "error" && (
          <p role="alert" className="text-center text-sm text-destructive">
            {errorMsg}
          </p>
        )}
      </div>

      {/* ═════════════ RIGHT: live chat ═════════════ */}
      <aside className={cn("relative", !chatOpen && !isHost && "hidden lg:block")}>
        <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:absolute lg:inset-0 lg:h-auto">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
            Live chat
          </h2>

          <ul
            ref={listRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            }}
            className="flex-1 space-y-3 overflow-y-auto p-3"
            aria-live="polite"
          >
            {feed.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No messages yet. Say hello!
              </li>
            ) : (
              feed.map((item) =>
                item.kind === "chat" ? (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <Avatar src={item.senderImage} name={item.senderName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-primary">
                          {item.senderName}
                        </span>
                        <time className="shrink-0 text-[11px] text-muted-foreground">
                          {formatTime(item.createdAt)}
                        </time>
                      </div>
                      <p className="wrap-break-word text-sm text-foreground">{item.text}</p>
                    </div>
                  </li>
                ) : (
                  <li
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/10 p-2.5"
                  >
                    <Avatar src={item.senderImage} name={item.senderName} />
                    <p className="min-w-0 flex-1 text-sm font-medium text-primary">
                      {item.senderName} sent a {item.giftName} to {hostName}!
                    </p>
                    <span className="text-3xl leading-none" aria-hidden="true">
                      {item.emoji}
                    </span>
                  </li>
                ),
              )
            )}
          </ul>

          <form onSubmit={handleSendChat} className="border-t border-border p-2.5">
            {chatError && (
              <p role="alert" className="mb-2 px-1 text-xs text-destructive">
                {chatError}
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                maxLength={MAX_CHAT_LENGTH}
                disabled={chatDisabled}
                placeholder={chatDisabled ? "Chat is unavailable" : "Write a message…"}
                aria-label="Write a message"
                autoComplete="off"
                className="h-10 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              />
              <Button
                type="submit"
                size="sm"
                className="h-10 rounded-full px-4"
                disabled={chatDisabled || sendingChat || chatText.trim().length === 0}
              >
                {sendingChat ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <SendHorizontal className="size-4" aria-hidden="true" />
                )}
                <span className="sr-only sm:not-sr-only">Send</span>
              </Button>
            </div>
          </form>
        </div>
      </aside>

      {!isHost && (
        <GiftModal
          open={giftOpen}
          onOpenChange={setGiftOpen}
          streamId={streamId}
          hostName={hostName}
          balance={balance}
          onSent={handleSent}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={isHost ? "Close this stream?" : "Leave this stream?"}
        description={dialogDescription}
        confirmLabel={isHost ? "Close stream" : "Leave"}
        cancelLabel={isHost ? "Keep streaming" : "Stay"}
        destructive={isHost}
        pending={isEnding}
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </section>
  );
}

/* ───────────────────────── small presentational helpers ───────────────────────── */

function StateOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 p-4 text-center text-sm text-white">
      {children}
    </div>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="size-9 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function BarButton({
  label,
  icon,
  onClick,
  disabled,
  pressed,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={cn(
        "flex min-h-14 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50",
        pressed && "bg-accent",
        className,
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}