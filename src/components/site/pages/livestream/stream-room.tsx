// src/components/site/pages/livestream/stream-room.tsx
"use client";

import {
  ConnectionQuality,
  ConnectionState,
  DisconnectReason,
  Room,
  RoomEvent,
  Track,
  VideoPresets,
  type Participant,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";
import {
  Camera,
  CameraOff,
  Coins,
  EllipsisVertical,
  Eye,
  Gift as GiftIcon,
  Heart,
  Loader2,
  LogOut,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Power,
  Radio,
  RectangleHorizontal,
  RectangleVertical,
  RefreshCw,
  SendHorizontal,
  Share2,
  ShieldAlert,
  SignalLow,
  SwitchCamera,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";

import { endLiveStream } from "@/app/actions/livestream/end-stream";
import { sendChatMessage } from "@/app/actions/livestream/send-chat-message";
import { sendReaction } from "@/app/actions/livestream/send-reaction";
import { Button } from "@/components/ui/button";
import { GIFTS, type Gift } from "@/data/gifts";
import {
  isChatPayload,
  isGiftPayload,
  isReactionPayload,
  LIVE_TOPICS,
  MAX_CHAT_LENGTH,
  type ChatEventPayload,
  type GiftEventPayload,
} from "@/lib/livestream/live-stream-events";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { GiftModal } from "./gift-modal";

type RoomStatus = "connecting" | "live" | "reconnecting" | "ended" | "error";
type Orientation = "portrait" | "landscape";
type Facing = "user" | "environment";

/** Why the camera / microphone could not start. */
type MediaIssue = "blocked" | "busy" | "missing" | "unsupported" | "unknown";

type FeedItem =
  | ({ kind: "chat" } & ChatEventPayload)
  | ({ kind: "gift" } & GiftEventPayload);

interface FeedEntry {
  uid: string;
  at: number;
  item: FeedItem;
}

interface FloatingHeart {
  id: number;
  offset: number;
}

/** 0 = small, 1 = big, 2 = epic */
type GiftTier = 0 | 1 | 2;
type GiftMotion = "pop" | "launch" | "drive" | "rise" | "drop";

interface GiftShow {
  id: string;
  emoji: string;
  giftName: string;
  senderName: string;
  senderImage: string | null;
  tier: GiftTier;
  cost: number;
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

const MAX_FEED = 40;
const MAX_VISIBLE_CHAT = 6;
const CHAT_TTL_MS = 18000;
const HEART_LIFETIME_MS = 2200;
const MAX_HEARTS = 30;
const MAX_GIFT_QUEUE = 6;
const MAX_SEEN_IDS = 600;
const DEDUPE_WINDOW_MS = 8000;
const PENDING_CHAT_WINDOW_MS = 15000;
const COUNT_POLL_MS = 2000;
const TOAST_MS = 2400;
const GIFT_DURATION: Record<GiftTier, number> = { 0: 3400, 1: 4400, 2: 6000 };

const CAMERA_COPY: Record<MediaIssue, { title: string; hint: string; toast: string }> = {
  blocked: {
    title: "Camera access is blocked",
    hint: "Click the lock icon next to the address bar and set Camera and Microphone to Allow. We'll retry automatically.",
    toast: "Camera access is blocked.",
  },
  busy: {
    title: "Your camera is used by another app",
    hint: "Close other tabs or apps using it (Zoom, Teams, OBS, Windows Camera). We'll retry when you come back.",
    toast: "Your camera is used by another app.",
  },
  missing: {
    title: "No camera found",
    hint: "Plug in a camera, then press Try again.",
    toast: "No camera found.",
  },
  unsupported: {
    title: "Camera isn't available here",
    hint: "Open this site over HTTPS in an up-to-date browser.",
    toast: "Camera isn't supported here.",
  },
  unknown: {
    title: "Couldn't start the camera",
    hint: "Press Try again. If it keeps failing, restart your browser.",
    toast: "Couldn't start the camera.",
  },
};

const MIC_COPY: Record<MediaIssue, string> = {
  blocked: "Microphone is blocked. Allow it from the address bar.",
  busy: "Microphone is used by another app.",
  missing: "No microphone found.",
  unsupported: "Microphone isn't available here.",
  unknown: "Microphone couldn't start.",
};

const KEYFRAMES = `
@keyframes narro-float {
  0%   { transform: translateY(0) scale(.6); opacity: 1; }
  100% { transform: translateY(-240px) scale(1.25); opacity: 0; }
}
.narro-float { animation: narro-float ${HEART_LIFETIME_MS}ms ease-out forwards; }

/* ───── chat on video ───── */
@keyframes chat-in {
  0%   { transform: translateX(-26px) scale(.9); opacity: 0; filter: blur(6px); }
  60%  { transform: translateX(3px) scale(1.02); opacity: 1; filter: blur(0); }
  100% { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
}
@keyframes chat-out {
  0%   { opacity: 1; }
  100% { opacity: 0; transform: translateY(-8px) scale(.97); }
}
@keyframes line-sheen {
  0%   { transform: translateX(-130%) skewX(-18deg); opacity: 1; }
  100% { transform: translateX(420%) skewX(-18deg); opacity: 0; }
}
@keyframes line-shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.chat-line {
  position: relative;
  overflow: hidden;
  animation:
    chat-in 300ms cubic-bezier(.2, .9, .3, 1.2) both,
    chat-out 700ms ease-in forwards;
  animation-delay: 0ms, calc(var(--ttl) - 700ms);
}
.chat-line::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 32%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
  animation: line-sheen 900ms ease-out 100ms both;
  pointer-events: none;
}
.gift-line {
  background: linear-gradient(110deg, rgba(107,74,58,.5), rgba(245,158,11,.32), rgba(107,74,58,.5));
  background-size: 200% 100%;
  animation:
    chat-in 300ms cubic-bezier(.2, .9, .3, 1.2) both,
    chat-out 700ms ease-in forwards,
    line-shimmer 2600ms linear infinite;
  animation-delay: 0ms, calc(var(--ttl) - 700ms), 0ms;
}

/* ───── menu, toast, camera card ───── */
@keyframes menu-in {
  0%   { opacity: 0; transform: translateY(10px) scale(.94); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.menu-in { animation: menu-in 180ms cubic-bezier(.2, .9, .3, 1.2) both; transform-origin: bottom right; }
@keyframes toast-in {
  0%   { opacity: 0; transform: translate(-50%, -10px) scale(.9); }
  100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
}
.toast-in { animation: toast-in 220ms cubic-bezier(.2, .9, .3, 1.2) both; }
@keyframes cam-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,.25); }
  50%      { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
}
.cam-pulse { animation: cam-pulse 2200ms ease-out infinite; }
@keyframes card-in {
  0%   { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
.card-in { animation: card-in 320ms ease-out both; }

/* ───── video fade-in + viewer count bump ───── */
@keyframes video-in {
  0%   { opacity: 0; transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
}
.video-in { animation: video-in 380ms ease-out both; }
@keyframes count-bump {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.18); }
  100% { transform: scale(1); }
}
.count-bump { animation: count-bump 360ms ease-out; }

/* ───── gift: entrances ───── */
@keyframes gift-pop {
  0%   { transform: scale(0) rotate(-18deg) translateY(60px); opacity: 0; }
  45%  { transform: scale(1.35) rotate(8deg) translateY(-14px); opacity: 1; }
  65%  { transform: scale(.92) rotate(-4deg) translateY(0); }
  82%  { transform: scale(1.08) rotate(2deg); }
  100% { transform: scale(1) rotate(0) translateY(0); opacity: 1; }
}
@keyframes gift-launch {
  0%   { transform: translate(-90px, 340px) scale(.4); opacity: 0; }
  45%  { transform: translate(8px, -22px) scale(1.2); opacity: 1; }
  70%  { transform: translate(0, 6px) scale(.95); }
  100% { transform: translate(0, 0) scale(1); opacity: 1; }
}
@keyframes gift-drive {
  0%   { transform: translateX(-340px) scale(.9) skewX(-14deg); opacity: 0; }
  55%  { transform: translateX(18px) scale(1.05) skewX(4deg); opacity: 1; }
  75%  { transform: translateX(-6px) skewX(0); }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}
@keyframes gift-rise {
  0%   { transform: translateY(140px) scale(.2); opacity: 0; }
  50%  { transform: translateY(-10px) scale(1.18); opacity: 1; }
  65%  { transform: translateY(0) scale(.96) rotate(-1.5deg); }
  80%  { transform: translateY(0) scale(1.03) rotate(1.5deg); }
  100% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
}
@keyframes gift-drop {
  0%   { transform: translateY(-340px) rotate(-35deg) scale(.7); opacity: 0; }
  55%  { transform: translateY(14px) rotate(8deg) scale(1.1); opacity: 1; }
  72%  { transform: translateY(-20px) rotate(-3deg) scale(1); }
  88%  { transform: translateY(4px) rotate(1deg); }
  100% { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
}
@keyframes gift-float {
  0%   { transform: translateY(0) scale(1); }
  100% { transform: translateY(-10px) scale(1.06); }
}

/* ───── gift: effects ───── */
@keyframes gift-ring {
  0%   { transform: scale(.2); opacity: .9; }
  100% { transform: scale(2.6); opacity: 0; }
}
@keyframes gift-particle {
  0%   { transform: translate(0, 0) scale(0) rotate(0); opacity: 0; }
  12%  { opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(var(--s)) rotate(var(--r)); opacity: 0; }
}
@keyframes gift-spark {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  70%  { opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(.2); opacity: 0; }
}
@keyframes gift-confetti {
  0%   { transform: translate3d(0, -20px, 0) rotate(0); opacity: 0; }
  8%   { opacity: 1; }
  100% { transform: translate3d(var(--sway), 100svh, 0) rotate(var(--cr)); opacity: 1; }
}
@keyframes gift-slide {
  0%   { transform: translateY(30px) scale(.85); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes gift-rays {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes gift-flash {
  0%   { opacity: 0; }
  15%  { opacity: .55; }
  100% { opacity: 0; }
}
@keyframes gift-edge {
  0%   { opacity: 0; }
  25%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes gift-shake {
  0%, 100% { transform: translate(0, 0); }
  15% { transform: translate(-6px, 3px) rotate(-.6deg); }
  30% { transform: translate(5px, -4px) rotate(.5deg); }
  45% { transform: translate(-4px, -2px); }
  60% { transform: translate(4px, 3px); }
  75% { transform: translate(-2px, 1px); }
}
@keyframes gift-exit {
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(.9) translateY(-16px); }
}
@keyframes gift-shine {
  0%   { transform: translateX(-120%) skewX(-20deg); }
  100% { transform: translateX(260%) skewX(-20deg); }
}
@keyframes gift-trail {
  0%   { transform: scaleY(.7); opacity: .75; }
  100% { transform: scaleY(1.15); opacity: 1; }
}
@keyframes gift-speed {
  0%   { transform: translateX(40px) scaleX(0); opacity: 0; }
  30%  { opacity: .9; }
  100% { transform: translateX(-30px) scaleX(1); opacity: 0; }
}

.gift-stage {
  animation: gift-exit 420ms ease-in forwards;
  animation-delay: calc(var(--dur) - 420ms);
}
.gift-shake { animation: gift-shake 700ms ease-in-out 420ms 1; }

.gift-emoji--pop    { animation: gift-pop 900ms cubic-bezier(.34, 1.56, .64, 1) both, gift-float 1500ms ease-in-out 900ms infinite alternate; }
.gift-emoji--launch { animation: gift-launch 1000ms cubic-bezier(.2, .9, .3, 1) both, gift-float 1300ms ease-in-out 1000ms infinite alternate; }
.gift-emoji--drive  { animation: gift-drive 1000ms cubic-bezier(.2, .9, .3, 1) both, gift-float 1600ms ease-in-out 1000ms infinite alternate; }
.gift-emoji--rise   { animation: gift-rise 1100ms cubic-bezier(.3, 1.2, .4, 1) both, gift-float 1700ms ease-in-out 1100ms infinite alternate; }
.gift-emoji--drop   { animation: gift-drop 1100ms cubic-bezier(.3, 1.1, .4, 1) both, gift-float 1500ms ease-in-out 1100ms infinite alternate; }

.gift-ring { animation: gift-ring 1400ms ease-out forwards; }
.gift-ring-2 { animation: gift-ring 1400ms ease-out 260ms forwards; opacity: 0; }
.gift-particle {
  animation: gift-particle var(--t) cubic-bezier(.15, .8, .3, 1) var(--d) forwards;
  opacity: 0;
}
.gift-spark {
  animation: gift-spark 1000ms cubic-bezier(.1, .7, .3, 1) var(--d) forwards;
  opacity: 0;
}
.gift-confetti {
  animation: gift-confetti var(--ct) linear var(--cd) forwards;
  opacity: 0;
}
.gift-pill { animation: gift-slide 520ms cubic-bezier(.34, 1.56, .64, 1) 260ms both; }
.gift-rays { animation: gift-rays 7s linear infinite; }
.gift-flash { animation: gift-flash 1100ms ease-out forwards; }
.gift-edge { animation: gift-edge 1800ms ease-out 2 forwards; }
.gift-trail { animation: gift-trail 140ms ease-in-out infinite alternate; }
.gift-speed { animation: gift-speed 560ms ease-out var(--sd) infinite; opacity: 0; }
.gift-shine::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  animation: gift-shine 1600ms ease-in-out 700ms 2;
}

@media (prefers-reduced-motion: reduce) {
  .narro-float, .chat-line, .chat-line::after, .gift-line, .menu-in, .toast-in, .cam-pulse, .card-in,
  .video-in, .count-bump,
  .gift-stage, .gift-shake,
  .gift-emoji--pop, .gift-emoji--launch, .gift-emoji--drive, .gift-emoji--rise, .gift-emoji--drop,
  .gift-ring, .gift-ring-2, .gift-particle, .gift-spark, .gift-confetti, .gift-pill,
  .gift-rays, .gift-flash, .gift-edge, .gift-trail, .gift-speed, .gift-shine::after {
    animation: none !important;
  }
  .gift-emoji--pop, .gift-emoji--launch, .gift-emoji--drive, .gift-emoji--rise, .gift-emoji--drop,
  .gift-pill, .chat-line, .menu-in, .toast-in, .card-in, .video-in { opacity: 1; }
  .gift-particle, .gift-spark, .gift-confetti, .gift-ring, .gift-ring-2, .gift-speed { opacity: 0; }
}
`;

/* ───────────────────────── pure helpers ───────────────────────── */

/** Turn a getUserMedia / LiveKit error into something the user can act on. */
function classifyMediaError(err: unknown): MediaIssue {
  const e = err as { name?: string; message?: string } | null;
  const name = e?.name ?? "";
  const msg = e?.message ?? "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
    return "blocked";
  }
  if (
    name === "NotReadableError" ||
    name === "TrackStartError" ||
    name === "AbortError" ||
    /could not start|in use|reserved|busy|starting video/i.test(msg)
  ) {
    return "busy";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
    return "missing";
  }
  if (name === "TypeError" || /mediadevices|secure context|getusermedia/i.test(msg)) {
    return "unsupported";
  }
  return "unknown";
}

function tierFromCost(cost: number): GiftTier {
  if (cost >= 1000) return 2;
  if (cost >= 100) return 1;
  return 0;
}

function costFromName(name: string): number {
  return GIFTS.find((x) => x.name === name)?.coinCost ?? 0;
}

function motionOf(name: string): GiftMotion {
  const n = name.toLowerCase();
  if (n.includes("rocket")) return "launch";
  if (n.includes("car")) return "drive";
  if (n.includes("castle")) return "rise";
  if (n.includes("crown")) return "drop";
  return "pop";
}

/**
 * Finds the host inside the room.
 * 1) the host's own screen -> the local participant
 * 2) a viewer's screen -> the participant whose identity is the host id
 * 3) fallback -> whoever is publishing camera / mic (only the host can publish),
 *    so the stream still works even if the token identity isn't the host's user id.
 */
function findHostParticipant(room: Room, hostId: string, isHost: boolean): Participant | undefined {
  if (isHost) return room.localParticipant;

  const direct = room.remoteParticipants.get(hostId);
  if (direct) return direct;

  for (const p of room.remoteParticipants.values()) {
    if (
      p.getTrackPublication(Track.Source.Camera) ||
      p.getTrackPublication(Track.Source.Microphone)
    ) {
      return p;
    }
  }
  return undefined;
}

/** Pure, deterministic 0..1 pseudo-random value (no Math.random during render). */
function seeded(seed: number, index: number, salt: number): number {
  const x = Math.sin((index + 1) * 12.9898 + salt * 78.233 + seed) * 43758.5453;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % 100000;
}

const NAME_COLORS = [
  "text-amber-200",
  "text-sky-200",
  "text-emerald-200",
  "text-pink-200",
  "text-violet-200",
  "text-orange-200",
  "text-cyan-200",
  "text-lime-200",
];
const nameColor = (name: string) => NAME_COLORS[hashString(name) % NAME_COLORS.length];

/* ───────────────────────── browser-state stores ───────────────────────── */

const LARGE_QUERY = "(min-width: 640px)";

function subscribeLarge(cb: () => void) {
  const mq = window.matchMedia(LARGE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getLarge = () => window.matchMedia(LARGE_QUERY).matches;
const getLargeServer = () => false;

function subscribeFullscreen(cb: () => void) {
  document.addEventListener("fullscreenchange", cb);
  return () => document.removeEventListener("fullscreenchange", cb);
}
const getFullscreen = () => Boolean(document.fullscreenElement);
const getFullscreenServer = () => false;

const subscribeNever = () => () => {};
const getFullscreenEnabled = () => Boolean(document.fullscreenEnabled);

/* ───────────────────────── component ───────────────────────── */

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
  /* ── refs ── */
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioHostRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const audioElsRef = useRef<Map<string, HTMLMediaElement>>(new Map());
  const listenMutedRef = useRef(false);
  const seenIds = useRef<Set<string>>(new Set());
  const heartTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const heartSeq = useRef(0);
  const pendingTaps = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendLock = useRef(false);
  const leavingRef = useRef(false);
  const camBusyRef = useRef(false);
  const micBusyRef = useRef(false);
  const localSeq = useRef(0);
  const pendingChats = useRef<{ tempId: string; text: string; at: number }[]>([]);
  const recentGifts = useRef<{ key: string; at: number; src: "local" | "remote" }[]>([]);

  /* ── state ── */
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const [hostOnline, setHostOnline] = useState(isHost);
  const [quality, setQuality] = useState<ConnectionQuality>(ConnectionQuality.Unknown);
  const [canPlayAudio, setCanPlayAudio] = useState(true);
  const [listenMuted, setListenMuted] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [camBusy, setCamBusy] = useState(false);
  const [camIssue, setCamIssue] = useState<MediaIssue | null>(null);
  const [micIssue, setMicIssue] = useState<MediaIssue | null>(null);
  const [facing, setFacing] = useState<Facing>("user");
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [giftQueue, setGiftQueue] = useState<GiftShow[]>([]);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [balance, setBalance] = useState(initialBalance);
  const [giftOpen, setGiftOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [sendingChat, setSendingChat] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [layoutPref, setLayoutPref] = useState<Orientation>("landscape");
  const [isEnding, startEnding] = useTransition();

  const isLarge = useSyncExternalStore(subscribeLarge, getLarge, getLargeServer);
  const isFullscreen = useSyncExternalStore(subscribeFullscreen, getFullscreen, getFullscreenServer);
  const canFullscreen = useSyncExternalStore(subscribeNever, getFullscreenEnabled, getFullscreenServer);

  // Small screens are always portrait. Large screens let the viewer choose.
  const orientation: Orientation = isLarge ? layoutPref : "portrait";
  const overlay = giftQueue[0] ?? null;

  /* ───────────────────────── helpers ───────────────────────── */

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  /** Leave on purpose: no browser "Leave site?" prompt, clean disconnect. */
  const leaveNow = useCallback(() => {
    leavingRef.current = true;
    void roomRef.current?.disconnect();
    window.location.replace("/live-stream");
  }, []);

  /** Returns true if this event id was already handled. Keeps the set small. */
  const markSeen = useCallback((id: string) => {
    const seen = seenIds.current;
    if (seen.has(id)) return true;
    seen.add(id);
    if (seen.size > MAX_SEEN_IDS) {
      const oldest = seen.values().next().value;
      if (oldest !== undefined) seen.delete(oldest);
    }
    return false;
  }, []);

  /* Browser prompt ONLY when the tab/window is closed, never for our own buttons. */
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (leavingRef.current || status !== "live") return;
      e.preventDefault();
      e.returnValue = "";
    };
    const onPageHide = () => {
      void roomRef.current?.disconnect();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [status]);

  /* Escape closes the menu */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

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

  const addFeed = useCallback((item: FeedItem) => {
    setFeed((prev) => [...prev, { uid: item.id, at: Date.now(), item }].slice(-MAX_FEED));
  }, []);

  const enqueueGift = useCallback((g: GiftShow) => {
    setGiftQueue((prev) => [...prev, g].slice(-MAX_GIFT_QUEUE));
  }, []);

  /**
   * The sender sees their gift instantly from the local send result, and the same
   * gift also arrives from the server. Whichever shows up second is a duplicate.
   */
  const claimGift = useCallback((key: string, src: "local" | "remote") => {
    const now = Date.now();
    recentGifts.current = recentGifts.current.filter((e) => now - e.at < DEDUPE_WINDOW_MS);
    const idx = recentGifts.current.findIndex((e) => e.key === key && e.src !== src);
    if (idx >= 0) {
      recentGifts.current.splice(idx, 1);
      return true;
    }
    recentGifts.current.push({ key, at: now, src });
    return false;
  }, []);

  /* ── Advance the gift queue ── */
  useEffect(() => {
    if (!overlay) return;
    const t = setTimeout(() => {
      setGiftQueue((prev) => prev.slice(1));
    }, GIFT_DURATION[overlay.tier]);
    return () => clearTimeout(t);
  }, [overlay]);

  /* ── Expire old chat lines ── */
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setFeed((prev) =>
        prev.some((e) => now - e.at > CHAT_TTL_MS)
          ? prev.filter((e) => now - e.at <= CHAT_TTL_MS)
          : prev,
      );
    }, 1500);
    return () => clearInterval(id);
  }, []);

  /* ───────────────────────── LiveKit connection ───────────────────────── */
  useEffect(() => {
    let cancelled = false;

    // Tuned for low latency: adaptive stream + dynacast + simulcast so every
    // viewer gets the best quality their connection can handle, instantly.
    const room = new Room({
      adaptiveStream: { pixelDensity: "screen" },
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
        facingMode: "user",
      },
      publishDefaults: {
        simulcast: true,
        videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
        videoEncoding: VideoPresets.h720.encoding,
        dtx: true,
        red: true,
      },
    });
    roomRef.current = room;
    const audioEls = audioElsRef.current;
    const heartTimerSet = heartTimers.current;

    /** Single source of truth for "who is here". Runs on every room event. */
    const updateCount = () => {
      if (room.state !== ConnectionState.Connected) return;

      const hostP = findHostParticipant(room, hostId, isHost);
      let viewers = 0;
      room.remoteParticipants.forEach((p) => {
        if (p !== hostP) viewers += 1;
      });

      // Host screen: everyone else is a viewer. Viewer screen: everyone else + me.
      setViewerCount(viewers + (isHost ? 0 : 1));
      setHostOnline(Boolean(hostP));
    };

    const attachHostVideo = () => {
      const el = videoRef.current;
      if (!el) return;
      const hostP = findHostParticipant(room, hostId, isHost);
      const pub = hostP?.getTrackPublication(Track.Source.Camera);
      const track = pub?.track;
      if (track && track.kind === Track.Kind.Video) {
        track.attach(el);
        const live = !pub?.isMuted;
        setHasVideo(live);
        if (isHost) setCamOn(live);
      } else {
        setHasVideo(false);
      }
    };

    const refreshAll = () => {
      updateCount();
      attachHostVideo();
    };

    const onTrackSubscribed = (
      track: RemoteTrack,
      pub: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      const hostP = findHostParticipant(room, hostId, isHost);
      if (hostP && participant.identity !== hostP.identity) return;

      if (track.kind === Track.Kind.Video) {
        attachHostVideo();
      } else if (track.kind === Track.Kind.Audio) {
        const el = track.attach();
        el.style.display = "none";
        el.muted = listenMutedRef.current;
        audioHostRef.current?.appendChild(el);
        audioEls.set(pub.trackSid, el);
      }
      updateCount();
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
      // Only trust packets sent by the SERVER (no participant sender).
      if (participant || !topic) return;

      let data: unknown;
      try {
        data = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }

      /* ── chat ── */
      if (topic === LIVE_TOPICS.chat && isChatPayload(data)) {
        if (markSeen(data.id)) return;
        const item: FeedItem = { kind: "chat", ...data };

        // Our own message echoed back: upgrade the optimistic line instead of duplicating it.
        if (data.senderId === currentUserId) {
          const idx = pendingChats.current.findIndex((p) => p.text === data.text);
          if (idx >= 0) {
            const [p] = pendingChats.current.splice(idx, 1);
            setFeed((prev) => prev.map((e) => (e.item.id === p.tempId ? { ...e, item } : e)));
            return;
          }
        }

        addFeed(item);
        return;
      }

      /* ── gift ── */
      if (topic === LIVE_TOPICS.gift && isGiftPayload(data)) {
        if (markSeen(data.id)) return;

        // Only de-duplicate against OUR OWN local gift. If the server tells us who sent it
        // and it wasn't us, never suppress it (two people can send the same gift together).
        const sentByMe = data.senderId ? data.senderId === currentUserId : undefined;
        if (sentByMe !== false && claimGift(data.giftId, "remote")) return;

        const cost = costFromName(data.giftName);
        const item: FeedItem = { kind: "gift", ...data };
        addFeed(item);
        enqueueGift({
          id: data.id,
          emoji: data.emoji,
          giftName: data.giftName,
          senderName: data.senderName,
          senderImage: data.senderImage,
          tier: tierFromCost(cost),
          cost,
        });
        return;
      }

      /* ── reaction ── */
      if (topic === LIVE_TOPICS.reaction && isReactionPayload(data)) {
        if (markSeen(data.id)) return;
        if (data.senderId !== currentUserId) spawnHearts(data.count);
      }
    };

    room
      .on(RoomEvent.TrackSubscribed, onTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
      .on(RoomEvent.TrackPublished, refreshAll)
      .on(RoomEvent.TrackUnpublished, refreshAll)
      .on(RoomEvent.LocalTrackPublished, refreshAll)
      .on(RoomEvent.LocalTrackUnpublished, refreshAll)
      .on(RoomEvent.TrackMuted, attachHostVideo)
      .on(RoomEvent.TrackUnmuted, attachHostVideo)
      // People joining / leaving update the count and the host state the same instant.
      .on(RoomEvent.ParticipantConnected, refreshAll)
      .on(RoomEvent.ParticipantDisconnected, refreshAll)
      .on(RoomEvent.ConnectionStateChanged, updateCount)
      .on(RoomEvent.DataReceived, onData)
      .on(RoomEvent.ConnectionQualityChanged, (q, p) => {
        if (p.isLocal) setQuality(q);
      })
      .on(RoomEvent.Reconnecting, () => setStatus("reconnecting"))
      .on(RoomEvent.Reconnected, () => {
        setStatus("live");
        refreshAll();
      })
      .on(RoomEvent.AudioPlaybackStatusChanged, () => setCanPlayAudio(room.canPlaybackAudio))
      .on(RoomEvent.Disconnected, (reason) => {
        if (cancelled || leavingRef.current || reason === DisconnectReason.CLIENT_INITIATED) return;
        if (reason === DisconnectReason.ROOM_DELETED) {
          setConfirmOpen(false);
          setStatus("ended");
        } else {
          setErrorMsg("You were disconnected from the stream.");
          setStatus("error");
        }
      });

    // Safety net: even if an event is delayed or dropped, the count and video self-heal.
    const poll = setInterval(() => {
      updateCount();
      if (!videoRef.current?.srcObject) attachHostVideo();
    }, COUNT_POLL_MS);

    (async () => {
      try {
        await room.connect(liveKitUrl, token);
        if (cancelled) {
          await room.disconnect();
          return;
        }

        if (process.env.NODE_ENV !== "production") {
          // If the host and a viewer print DIFFERENT room names / identities here,
          // the token route is minting tokens for different rooms.
          console.info("[stream-room] connected", {
            room: room.name,
            me: room.localParticipant.identity,
            isHost,
            hostId,
            others: Array.from(room.remoteParticipants.keys()),
          });
        }

        // The stream goes live even if the camera or mic can't start.
        // Each one is tried on its own, and a failure only shows a helpful message.
        if (isHost) {
          const [cam, mic] = await Promise.allSettled([
            room.localParticipant.setCameraEnabled(true),
            room.localParticipant.setMicrophoneEnabled(true),
          ]);
          if (cancelled) return;

          if (cam.status === "rejected") {
            setCamOn(false);
            setCamIssue(classifyMediaError(cam.reason));
          } else {
            setCamOn(true);
            setCamIssue(null);
          }

          if (mic.status === "rejected") {
            setMicOn(false);
            setMicIssue(classifyMediaError(mic.reason));
          } else {
            setMicOn(true);
            setMicIssue(null);
          }
        }

        setStatus("live");
        setCanPlayAudio(room.canPlaybackAudio);
        refreshAll();
      } catch {
        if (!cancelled) {
          setErrorMsg("Couldn't connect to the stream.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(poll);
      if (tapTimer.current) clearTimeout(tapTimer.current);
      heartTimerSet.forEach((t) => clearTimeout(t));
      heartTimerSet.clear();
      room.removeAllListeners();
      audioEls.forEach((el) => el.remove());
      audioEls.clear();
      void room.disconnect();
      roomRef.current = null;
    };
  }, [
    hostId,
    isHost,
    liveKitUrl,
    token,
    currentUserId,
    spawnHearts,
    enqueueGift,
    claimGift,
    addFeed,
    markSeen,
  ]);

  /* ── Apply mute to host audio ── */
  useEffect(() => {
    listenMutedRef.current = listenMuted;
    audioElsRef.current.forEach((el) => {
      el.muted = listenMuted;
    });
  }, [listenMuted]);

  /* ───────────────────────── camera / mic ───────────────────────── */

  const setCamera = useCallback(
    async (next: boolean, silent = false) => {
      const room = roomRef.current;
      if (!room || camBusyRef.current) return;
      camBusyRef.current = true;
      setCamBusy(true);
      try {
        await room.localParticipant.setCameraEnabled(next);
        setCamOn(next);
        setCamIssue(null);
        if (next && !silent) showToast("Camera is on");
      } catch (err) {
        if (next) {
          const kind = classifyMediaError(err);
          setCamOn(false);
          setCamIssue(kind);
          if (!silent) showToast(CAMERA_COPY[kind].toast);
        } else {
          showToast("Couldn't turn the camera off.");
        }
      } finally {
        camBusyRef.current = false;
        setCamBusy(false);
      }
    },
    [showToast],
  );

  const setMic = useCallback(
    async (next: boolean, silent = false) => {
      const room = roomRef.current;
      if (!room || micBusyRef.current) return;
      micBusyRef.current = true;
      try {
        await room.localParticipant.setMicrophoneEnabled(next);
        setMicOn(next);
        setMicIssue(null);
      } catch (err) {
        if (next) {
          const kind = classifyMediaError(err);
          setMicOn(false);
          setMicIssue(kind);
          if (!silent) showToast(MIC_COPY[kind]);
        } else {
          showToast("Couldn't change the microphone.");
        }
      } finally {
        micBusyRef.current = false;
      }
    },
    [showToast],
  );

  const toggleMic = useCallback(() => {
    void setMic(!micOn);
  }, [micOn, setMic]);

  const toggleCam = useCallback(() => {
    void setCamera(!camOn);
  }, [camOn, setCamera]);

  /* ── Auto-retry the camera when the problem is likely fixed ──
     (permission allowed, the user comes back to the tab, or a device is plugged in) */
  useEffect(() => {
    if (!isHost || status !== "live" || camOn || !camIssue || camIssue === "unsupported") return;

    const retry = () => {
      if (document.visibilityState === "visible") void setCamera(true, true);
    };

    window.addEventListener("focus", retry);
    document.addEventListener("visibilitychange", retry);

    let perm: PermissionStatus | null = null;
    const onPerm = () => {
      if (perm?.state === "granted") retry();
    };
    try {
      void navigator.permissions
        ?.query({ name: "camera" as PermissionName })
        .then((p) => {
          perm = p;
          p.addEventListener("change", onPerm);
        })
        .catch(() => {});
    } catch {
      /* Permissions API not supported */
    }

    const devices = navigator.mediaDevices;
    devices?.addEventListener?.("devicechange", retry);

    return () => {
      window.removeEventListener("focus", retry);
      document.removeEventListener("visibilitychange", retry);
      perm?.removeEventListener("change", onPerm);
      devices?.removeEventListener?.("devicechange", retry);
    };
  }, [isHost, status, camOn, camIssue, setCamera]);

  const flipCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const track = room.localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack;
    if (!track) {
      showToast("Turn the camera on first.");
      return;
    }
    const next: Facing = facing === "user" ? "environment" : "user";
    try {
      await track.restartTrack({ facingMode: next });
      setFacing(next);
    } catch {
      showToast("This device has no other camera.");
    }
  }, [facing, showToast]);

  /* ───────────────────────── other actions ───────────────────────── */
  const enableAudio = useCallback(async () => {
    try {
      await roomRef.current?.startAudio();
      setCanPlayAudio(true);
    } catch {
      /* still blocked */
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      showToast("Fullscreen isn't supported here.");
    }
  }, [showToast]);

  const shareStream = useCallback(async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      /* share sheet dismissed */
    }
  }, [title, showToast]);

  const handleHeart = useCallback(() => {
    if (status !== "live") return;
    spawnHearts(1);
    pendingTaps.current += 1;
    if (tapTimer.current) return;

    // Short batching window so taps feel instant but we don't spam the server.
    tapTimer.current = setTimeout(() => {
      const count = Math.min(pendingTaps.current, 5);
      pendingTaps.current = 0;
      tapTimer.current = null;
      if (count > 0) void sendReaction({ streamId, count }).catch(() => {});
    }, 350);
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

      // Optimistic: the line shows on the video instantly, before the server answers.
      localSeq.current += 1;
      const tempId = `local-chat-${Date.now()}-${localSeq.current}`;
      const now = Date.now();
      pendingChats.current = pendingChats.current.filter(
        (p) => now - p.at < PENDING_CHAT_WINDOW_MS,
      );
      pendingChats.current.push({ tempId, text, at: now });

      addFeed({
        kind: "chat",
        id: tempId,
        senderId: currentUserId,
        senderName: "You",
        senderImage: isHost ? hostImage : null,
        text,
        createdAt: new Date().toISOString(),
      });

      const rollback = () => {
        pendingChats.current = pendingChats.current.filter((p) => p.tempId !== tempId);
        setFeed((prev) => prev.filter((m) => m.item.id !== tempId));
        setChatText(text);
      };

      // Keep the keyboard open and let the user type the next message right away.
      sendLock.current = false;
      setSendingChat(false);
      inputRef.current?.focus();

      try {
        const res = await sendChatMessage({ streamId, text });
        if (!res.success) {
          setChatError(res.error);
          rollback();
        }
      } catch {
        setChatError("Message couldn't be sent. Try again.");
        rollback();
      }
    },
    [chatText, status, streamId, currentUserId, isHost, hostImage, addFeed],
  );

  const requestClose = useCallback(() => {
    setMenuOpen(false);
    if (status === "ended") {
      leaveNow();
      return;
    }
    // The confirm dialog lives on the page, so leave fullscreen first or it would be hidden.
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    setErrorMsg(null);
    setConfirmOpen(true);
  }, [status, leaveNow]);

  const cancelClose = useCallback(() => {
    if (!isEnding) setConfirmOpen(false);
  }, [isEnding]);

  const confirmClose = () => {
    if (!isHost) {
      setConfirmOpen(false);
      leaveNow();
      return;
    }

    startEnding(async () => {
      const res = await endLiveStream({ streamId });
      if (res.success) {
        setConfirmOpen(false);
        leaveNow();
      } else {
        setErrorMsg(res.error ?? "Failed to end the stream.");
        setConfirmOpen(false);
      }
    });
  };

  /** Called by the gift modal the moment the server confirms the gift. */
  const handleSent = useCallback(
    (gift: Gift, newBalance: number) => {
      setBalance(newBalance);

      const duplicate = claimGift(gift.id, "local");
      if (duplicate) return; // the server copy already played and was added

      localSeq.current += 1;
      const uid = `local-gift-${Date.now()}-${localSeq.current}`;

      enqueueGift({
        id: uid,
        emoji: gift.emoji,
        giftName: gift.name,
        senderName: "You",
        senderImage: null,
        tier: tierFromCost(gift.coinCost),
        cost: gift.coinCost,
      });

      addFeed({
        kind: "gift",
        id: uid,
        giftId: gift.id,
        giftName: gift.name,
        emoji: gift.emoji,
        senderName: "You",
        senderImage: null,
        createdAt: new Date().toISOString(),
      });
    },
    [claimGift, enqueueGift, addFeed],
  );

  const initial = useMemo(() => hostName.trim().charAt(0).toUpperCase() || "?", [hostName]);
  const chatDisabled = status !== "live";
  const visibleFeed = feed.slice(-MAX_VISIBLE_CHAT);
  const mirrorHost = isHost && facing === "user";
  const weakSignal =
    status === "live" && (quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost);

  const dialogDescription = isHost
    ? viewerCount > 0
      ? `This ends the live stream for you and ${viewerCount} ${viewerCount === 1 ? "viewer" : "viewers"}. This can't be undone.`
      : "This ends your live stream. This can't be undone."
    : "You'll stop watching. You can rejoin anytime while the host is still live.";

  /* ───────────────────────── render ───────────────────────── */
  return (
    <section aria-label={`Live stream: ${title}`} className="bg-transparent py-3 sm:py-4">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div
        ref={wrapRef}
        className={cn(
          "relative mx-auto w-full overflow-hidden border border-white/10 bg-black shadow-2xl transition-[max-width] duration-500",
          orientation === "portrait"
            ? "aspect-9/16 max-w-[calc(84svh*9/16)] rounded-2xl sm:rounded-3xl"
            : "aspect-video max-w-[calc(80svh*16/9)] rounded-3xl",
          "[&:fullscreen]:max-h-none [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:border-0",
        )}
      >
        {/* opacity (not visibility) so adaptive-stream never thinks the video is hidden */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isHost}
          className={cn(
            "size-full object-cover transition-opacity duration-300",
            mirrorHost && "-scale-x-100",
            hasVideo ? "video-in opacity-100" : "opacity-0",
          )}
        />
        <div ref={audioHostRef} aria-hidden="true" />

        {/* ── camera-off card: sits UNDER the controls so they always stay usable ── */}
        {status === "live" && !hasVideo && (
          <CameraCard
            isHost={isHost}
            hostName={hostName}
            hostImage={hostImage}
            initial={initial}
            hostOnline={hostOnline}
            starting={isHost && camOn}
            busy={camBusy}
            issue={camIssue}
            onRetry={() => void setCamera(true)}
          />
        )}

        {/* readability gradients */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-linear-to-b from-black/60 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-linear-to-t from-black/70 via-black/25 to-transparent"
          aria-hidden="true"
        />

        {/* ── top bar ── */}
        <div className="absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-2 p-3">
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-black/40 py-1 pl-1 pr-3 backdrop-blur-md">
            {hostImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hostImage} alt="" className="size-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6B4A3A] text-sm font-semibold text-white">
                {initial}
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-white">{hostName}</span>
                <span className="shrink-0 rounded bg-[#6B4A3A] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Host
                </span>
              </div>
              <span className="block truncate text-[11px] text-white/70">
                {hostFollowers.toLocaleString()} {hostFollowers === 1 ? "follower" : "followers"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {weakSignal && (
              <span
                role="status"
                className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-500/25 px-2 py-1 text-[11px] font-medium text-amber-50 backdrop-blur-md"
              >
                <SignalLow className="size-3.5" aria-hidden="true" />
                Weak signal
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
              LIVE
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-md"
              aria-label={`${viewerCount} watching`}
            >
              <Eye className="size-3.5" aria-hidden="true" />
              {/* key = count, so React remounts this span and replays the bump animation */}
              <span key={viewerCount} className="count-bump inline-block">
                {viewerCount.toLocaleString()}
              </span>
            </span>
            <button
              type="button"
              onClick={requestClose}
              aria-label={isHost ? "Close stream" : "Leave stream"}
              className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <h1 className="pointer-events-none absolute inset-x-3 top-16 z-30 truncate text-sm font-semibold text-white drop-shadow sm:text-base">
          {title}
        </h1>

        {/* ── mic problem chip (host) ── */}
        {isHost && micIssue && status === "live" && (
          <button
            type="button"
            onClick={() => void setMic(true)}
            className="absolute left-3 top-24 z-40 inline-flex max-w-[85%] items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-500/25 px-3 py-1 text-xs font-medium text-amber-50 backdrop-blur-md transition-colors hover:bg-amber-500/40"
          >
            <MicOff className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{MIC_COPY[micIssue]}</span>
            <span className="shrink-0 font-semibold underline">Retry</span>
          </button>
        )}

        {/* ── toast ── */}
        {toast && (
          <div
            role="status"
            className="toast-in absolute left-1/2 top-16 z-50 max-w-[90%] -translate-x-1/2 truncate rounded-full border border-white/15 bg-black/80 px-4 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur-md"
          >
            {toast}
          </div>
        )}

        {/* ── floating hearts ── */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
          {hearts.map((h) => (
            <Heart
              key={h.id}
              className="narro-float absolute bottom-20 size-7 fill-red-500 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
              style={{ right: 12 + h.offset }}
            />
          ))}
        </div>

        {/* ── gift animation ── */}
        {overlay && <GiftOverlay key={overlay.id} gift={overlay} hostName={hostName} />}

        {/* ── live chat on the video (transparent glass) ── */}
        <ul
          aria-live="polite"
          className="pointer-events-none absolute bottom-[5.25rem] left-3 z-20 flex max-h-[45%] w-[84%] max-w-sm flex-col justify-end gap-1.5 overflow-hidden sm:w-[60%]"
          style={
            {
              "--ttl": `${CHAT_TTL_MS}ms`,
              maskImage: "linear-gradient(to top, black 65%, transparent)",
              WebkitMaskImage: "linear-gradient(to top, black 65%, transparent)",
            } as CSSProperties
          }
        >
          {visibleFeed.map(({ uid, item }) =>
            item.kind === "chat" ? (
              <li
                key={uid}
                className="chat-line flex max-w-full items-start gap-2 self-start rounded-2xl border border-white/10 bg-white/6 py-1.5 pl-1.5 pr-3 backdrop-blur-[3px]"
              >
                <Avatar src={item.senderImage} name={item.senderName} />
                <p className="min-w-0 pt-0.5 text-[13px] leading-snug text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.75)]">
                  <span className={cn("mr-1.5 font-semibold", nameColor(item.senderName))}>
                    {item.senderName}
                  </span>
                  <span className="wrap-break-word">{item.text}</span>
                </p>
              </li>
            ) : (
              <li
                key={uid}
                className="chat-line gift-line flex max-w-full items-center gap-2 self-start rounded-2xl border border-amber-300/30 py-1.5 pl-1.5 pr-3 backdrop-blur-[3px]"
              >
                <Avatar src={item.senderImage} name={item.senderName} />
                <p className="min-w-0 text-[13px] font-medium leading-snug text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.75)]">
                  <span className="font-semibold text-amber-100">{item.senderName}</span> sent a{" "}
                  {item.giftName}
                </p>
                <span className="text-2xl leading-none" aria-hidden="true">
                  {item.emoji}
                </span>
              </li>
            ),
          )}
        </ul>

        {chatError && (
          <p
            role="alert"
            className="absolute bottom-[4.4rem] left-3 z-30 max-w-[90%] truncate rounded-full bg-red-600/85 px-3 py-0.5 text-xs text-white backdrop-blur-sm"
          >
            {chatError}
          </p>
        )}

        {/* ── bottom controls (always above every overlay) ── */}
        <div className="absolute inset-x-0 bottom-0 z-45 flex items-center gap-2 p-3">
          <form onSubmit={handleSendChat} className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              maxLength={MAX_CHAT_LENGTH}
              disabled={chatDisabled}
              placeholder={chatDisabled ? "Chat is unavailable" : "Say something…"}
              aria-label="Write a message"
              autoComplete="off"
              enterKeyHint="send"
              className="h-10 w-full rounded-full border border-white/20 bg-black/40 pl-4 pr-11 text-[16px] text-white outline-none backdrop-blur-md placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60 sm:text-sm"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={chatDisabled || sendingChat || chatText.trim().length === 0}
              className="absolute right-1 top-1 inline-flex size-8 items-center justify-center rounded-full bg-[#6B4A3A] text-white transition-opacity hover:bg-[#5a3f31] disabled:opacity-40"
            >
              {sendingChat ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <SendHorizontal className="size-4" aria-hidden="true" />
              )}
            </button>
          </form>

          {isHost ? (
            <>
              <RoundBtn
                label={micOn ? "Mute microphone" : "Turn microphone on"}
                onClick={toggleMic}
                disabled={status !== "live"}
                danger={!micOn}
              >
                {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
              </RoundBtn>
              <RoundBtn
                label={camOn ? "Turn camera off" : "Turn camera on"}
                onClick={toggleCam}
                disabled={status !== "live" || camBusy}
                danger={!camOn}
              >
                {camBusy ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : camOn ? (
                  <Camera className="size-5" />
                ) : (
                  <CameraOff className="size-5" />
                )}
              </RoundBtn>
            </>
          ) : (
            <>
              <RoundBtn label="Send a heart" onClick={handleHeart} disabled={status !== "live"}>
                <Heart className="size-5 fill-red-500 text-red-500" />
              </RoundBtn>
              <button
                type="button"
                onClick={() => setGiftOpen(true)}
                disabled={status === "ended"}
                aria-label="Send a gift"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#8a5f4a] via-[#6B4A3A] to-amber-600 text-white shadow-lg shadow-[#6B4A3A]/40 transition-transform hover:scale-105 active:scale-90 disabled:opacity-50"
              >
                <GiftIcon className="size-5" aria-hidden="true" />
              </button>
              <RoundBtn
                label={listenMuted ? "Unmute stream" : "Mute stream"}
                onClick={() => setListenMuted((m) => !m)}
                danger={listenMuted}
              >
                {listenMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </RoundBtn>
            </>
          )}

          <RoundBtn label="More options" onClick={() => setMenuOpen((o) => !o)} active={menuOpen}>
            <EllipsisVertical className="size-5" />
          </RoundBtn>
        </div>

        {/* ── more-options menu (inside the video, so it also works in fullscreen) ── */}
        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 z-46 cursor-default"
            />
            <div
              role="menu"
              aria-label="More options"
              className="menu-in absolute bottom-[4.25rem] right-3 z-47 w-56 overflow-hidden rounded-2xl border border-white/15 bg-black/80 p-1.5 text-white shadow-2xl backdrop-blur-xl"
            >
              <MenuItem
                icon={<Share2 className="size-4" />}
                label="Share stream"
                onClick={() => {
                  setMenuOpen(false);
                  void shareStream();
                }}
              />

              {isHost && (
                <MenuItem
                  icon={<SwitchCamera className="size-4" />}
                  label="Flip camera"
                  onClick={() => {
                    setMenuOpen(false);
                    void flipCamera();
                  }}
                />
              )}

              <MenuItem
                className="hidden sm:flex"
                icon={
                  orientation === "portrait" ? (
                    <RectangleHorizontal className="size-4" />
                  ) : (
                    <RectangleVertical className="size-4" />
                  )
                }
                label={orientation === "portrait" ? "Landscape view" : "Portrait view"}
                onClick={() => {
                  setMenuOpen(false);
                  setLayoutPref(orientation === "portrait" ? "landscape" : "portrait");
                }}
              />

              {canFullscreen && (
                <MenuItem
                  icon={isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                  label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  onClick={() => {
                    setMenuOpen(false);
                    void toggleFullscreen();
                  }}
                />
              )}

              <div className="my-1 h-px bg-white/10" />

              <MenuItem
                danger
                icon={isHost ? <Power className="size-4" /> : <LogOut className="size-4" />}
                label={isHost ? "End stream" : "Leave stream"}
                onClick={requestClose}
              />
            </div>
          </>
        )}

        {/* ── blocking states (only real connection problems) ── */}
        {status === "connecting" && (
          <StateOverlay>
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
            <p>{isHost ? "Starting your stream…" : "Joining stream…"}</p>
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
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="size-4" aria-hidden="true" />
                Reconnect
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/live-stream">Back to live streams</Link>
              </Button>
            </div>
          </StateOverlay>
        )}

        {status === "ended" && (
          <StateOverlay>
            <Radio className="size-6" aria-hidden="true" />
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
            className="absolute left-1/2 top-24 z-40 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#6B4A3A] px-3.5 py-1.5 text-xs font-medium text-white shadow-lg"
          >
            <Volume2 className="size-4" aria-hidden="true" />
            Tap to hear
          </button>
        )}
      </div>

      {errorMsg && status !== "error" && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {errorMsg}
        </p>
      )}

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

/* ───────────────────────── camera card ───────────────────────── */

function CameraCard({
  isHost,
  hostName,
  hostImage,
  initial,
  hostOnline,
  starting,
  busy,
  issue,
  onRetry,
}: {
  isHost: boolean;
  hostName: string;
  hostImage: string | null;
  initial: string;
  hostOnline: boolean;
  starting: boolean;
  busy: boolean;
  issue: MediaIssue | null;
  onRetry: () => void;
}) {
  const copy = issue ? CAMERA_COPY[issue] : null;
  const showIssue = isHost && !starting && copy;

  const title = starting
    ? "Starting your camera…"
    : showIssue
      ? copy.title
      : isHost
        ? "Your camera is off"
        : hostOnline
          ? `${hostName}'s camera is off`
          : "Waiting for the host…";

  const hint = starting
    ? "Hang on a moment."
    : showIssue
      ? copy.hint
      : isHost
        ? "Viewers can still hear you. Turn it on to be seen."
        : hostOnline
          ? "You can still hear the stream and chat."
          : "The stream will start when the host joins.";

  return (
    <div className="absolute inset-0 z-5 flex items-center justify-center overflow-hidden text-white">
      {hostImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hostImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full scale-125 object-cover opacity-30 blur-2xl"
        />
      )}
      <div
        className="absolute inset-0 bg-linear-to-b from-black/50 via-black/60 to-black/80"
        aria-hidden="true"
      />

      <div className="card-in relative flex max-h-full w-full max-w-md flex-col items-center gap-3 overflow-y-auto px-6 py-24 text-center sm:py-20">
        <div className="relative">
          {hostImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hostImage}
              alt=""
              className="cam-pulse size-20 rounded-full border-2 border-white/30 object-cover shadow-2xl sm:size-24"
            />
          ) : (
            <span className="cam-pulse flex size-20 items-center justify-center rounded-full border-2 border-white/30 bg-[#6B4A3A] text-3xl font-semibold shadow-2xl sm:size-24">
              {initial}
            </span>
          )}
          <span
            className={cn(
              "absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-black",
              showIssue && issue === "blocked" ? "bg-amber-500" : "bg-red-600",
            )}
            aria-hidden="true"
          >
            {starting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : showIssue && issue === "blocked" ? (
              <ShieldAlert className="size-4" />
            ) : (
              <CameraOff className="size-4" />
            )}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold sm:text-lg">{title}</p>
          <p className="text-xs leading-relaxed text-white/75 sm:text-sm">{hint}</p>
        </div>

        {isHost && !starting && (
          <button
            type="button"
            onClick={onRetry}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : showIssue ? (
              <RefreshCw className="size-4" aria-hidden="true" />
            ) : (
              <Camera className="size-4" aria-hidden="true" />
            )}
            {showIssue ? "Try again" : "Turn camera on"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── gift animation ───────────────────────── */

const PARTICLE_GLYPHS = ["✨", "💖", "⭐", "🎉", "💫"];
const PARTICLE_COUNT: Record<GiftTier, number> = { 0: 12, 1: 22, 2: 36 };
const CONFETTI_COLORS = ["#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#a78bfa", "#fb7185"];
const FIREWORKS = [
  { x: 22, y: 30, delay: 350, color: "#fbbf24" },
  { x: 78, y: 24, delay: 900, color: "#f472b6" },
  { x: 50, y: 14, delay: 1450, color: "#60a5fa" },
];

function GiftOverlay({ gift, hostName }: { gift: GiftShow; hostName: string }) {
  const { tier, id, cost } = gift;
  const motion = motionOf(gift.giftName);
  const dur = GIFT_DURATION[tier];

  // Pure + deterministic: derived from the gift id, so no Math.random in render.
  const fx = useMemo(() => {
    const seed = hashString(id);

    const burstCount = PARTICLE_COUNT[tier];
    const particles = Array.from({ length: burstCount }, (_, i) => {
      const angle = (i / burstCount) * Math.PI * 2 + seeded(seed, i, 1) * 0.5;
      const dist = 90 + seeded(seed, i, 2) * (tier === 2 ? 190 : 130);
      return {
        key: i,
        glyph: PARTICLE_GLYPHS[i % PARTICLE_GLYPHS.length],
        style: {
          "--dx": `${Math.round(Math.cos(angle) * dist)}px`,
          "--dy": `${Math.round(Math.sin(angle) * dist)}px`,
          "--s": (0.7 + seeded(seed, i, 3) * 0.9).toFixed(2),
          "--r": `${Math.round((seeded(seed, i, 4) - 0.5) * 360)}deg`,
          "--t": `${1100 + Math.round(seeded(seed, i, 5) * 900)}ms`,
          "--d": `${150 + Math.round(seeded(seed, i, 6) * 350)}ms`,
        } as CSSProperties,
      };
    });

    const confettiCount = tier === 2 ? 42 : tier === 1 ? 18 : 0;
    const confetti = Array.from({ length: confettiCount }, (_, i) => ({
      key: i,
      style: {
        left: `${Math.round(seeded(seed, i, 11) * 100)}%`,
        width: `${6 + Math.round(seeded(seed, i, 12) * 6)}px`,
        height: `${10 + Math.round(seeded(seed, i, 13) * 8)}px`,
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        "--sway": `${Math.round((seeded(seed, i, 14) - 0.5) * 140)}px`,
        "--cr": `${Math.round(360 + seeded(seed, i, 15) * 720)}deg`,
        "--ct": `${2200 + Math.round(seeded(seed, i, 16) * 1600)}ms`,
        "--cd": `${Math.round(seeded(seed, i, 17) * 1100)}ms`,
      } as CSSProperties,
    }));

    const sparks =
      tier === 2
        ? FIREWORKS.flatMap((fw, b) =>
            Array.from({ length: 12 }, (_, i) => {
              const angle = (i / 12) * Math.PI * 2 + b * 0.4;
              const dist = 46 + seeded(seed, b * 12 + i, 7) * 46;
              return {
                key: `${b}-${i}`,
                style: {
                  left: `${fw.x}%`,
                  top: `${fw.y}%`,
                  background: fw.color,
                  boxShadow: `0 0 10px 2px ${fw.color}`,
                  "--dx": `${Math.round(Math.cos(angle) * dist)}px`,
                  "--dy": `${Math.round(Math.sin(angle) * dist)}px`,
                  "--d": `${fw.delay}ms`,
                } as CSSProperties,
              };
            }),
          )
        : [];

    return { particles, confetti, sparks };
  }, [tier, id]);

  return (
    <div
      role="status"
      aria-label={`${gift.senderName} sent a ${gift.giftName}`}
      className="gift-stage pointer-events-none absolute inset-0 z-20 overflow-hidden"
      style={{ "--dur": `${dur}ms` } as CSSProperties}
    >
      {/* epic: flash + pulsing golden edge */}
      {tier === 2 && (
        <>
          <div
            className="gift-flash absolute inset-0 bg-linear-to-b from-amber-300/60 via-fuchsia-500/30 to-transparent"
            aria-hidden="true"
          />
          <div
            className="gift-edge absolute inset-0 shadow-[inset_0_0_90px_14px_rgba(251,191,36,0.55)]"
            aria-hidden="true"
          />
        </>
      )}

      {/* confetti rain */}
      <div className="absolute inset-0" aria-hidden="true">
        {fx.confetti.map((c) => (
          <span key={c.key} className="gift-confetti absolute top-0 rounded-xs" style={c.style} />
        ))}
      </div>

      {/* fireworks */}
      <div className="absolute inset-0" aria-hidden="true">
        {fx.sparks.map((s) => (
          <span key={s.key} className="gift-spark absolute size-1.5 rounded-full" style={s.style} />
        ))}
      </div>

      {/* centre stage */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-3 px-3 pb-20",
          tier === 2 && "gift-shake",
        )}
      >
        <div className="relative flex items-center justify-center" aria-hidden="true">
          {/* glow */}
          <div
            className={cn(
              "absolute rounded-full blur-3xl",
              tier === 2
                ? "size-64 bg-amber-400/40 sm:size-80"
                : tier === 1
                  ? "size-48 bg-red-500/35"
                  : "size-36 bg-red-500/25",
            )}
          />

          {/* rotating rays */}
          {tier > 0 && (
            <div
              className={cn(
                "gift-rays absolute rounded-full opacity-60",
                tier === 2 ? "size-72 sm:size-96" : "size-56",
              )}
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0 8%, rgba(255,214,102,.55) 10%, transparent 14% 24%, rgba(255,214,102,.55) 26%, transparent 30% 40%, rgba(255,214,102,.55) 42%, transparent 46% 56%, rgba(255,214,102,.55) 58%, transparent 62% 72%, rgba(255,214,102,.55) 74%, transparent 78% 88%, rgba(255,214,102,.55) 90%, transparent 94%)",
                maskImage: "radial-gradient(circle, black 25%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(circle, black 25%, transparent 70%)",
              }}
            />
          )}

          {/* shock rings */}
          <span className="gift-ring absolute size-24 rounded-full border-2 border-white/70" />
          <span className="gift-ring-2 absolute size-24 rounded-full border-2 border-amber-300/70" />

          {/* sparkle burst */}
          {fx.particles.map((p) => (
            <span
              key={p.key}
              className="gift-particle absolute left-1/2 top-1/2 -ml-2.5 -mt-2.5 text-xl leading-none sm:text-2xl"
              style={p.style}
            >
              {p.glyph}
            </span>
          ))}

          {/* rocket: flame trail */}
          {motion === "launch" && (
            <span
              className="gift-trail absolute left-1/2 top-1/2 h-28 w-3 origin-top -translate-x-1/2 rotate-45 rounded-full bg-linear-to-b from-amber-200 via-orange-500 to-transparent blur-[3px]"
              style={{ transformOrigin: "top" }}
            />
          )}

          {/* car: speed lines */}
          {motion === "drive" &&
            [0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="gift-speed absolute right-1/2 mr-16 h-0.5 w-24 rounded-full bg-linear-to-l from-white to-transparent"
                style={
                  {
                    top: `calc(50% + ${(i - 1.5) * 14}px)`,
                    "--sd": `${i * 90}ms`,
                  } as CSSProperties
                }
              />
            ))}

          {/* the gift */}
          <span
            className={cn(
              "relative leading-none drop-shadow-[0_8px_24px_rgba(0,0,0,.55)]",
              `gift-emoji--${motion}`,
              tier === 2
                ? "text-8xl sm:text-9xl"
                : tier === 1
                  ? "text-7xl sm:text-8xl"
                  : "text-6xl sm:text-7xl",
            )}
          >
            {gift.emoji}
          </span>
        </div>

        {/* sender pill */}
        <span
          className={cn(
            "gift-pill gift-shine relative flex max-w-full items-center gap-2 overflow-hidden rounded-full border py-1.5 pl-1.5 pr-3 text-xs text-white shadow-xl backdrop-blur-md sm:text-sm",
            tier === 2
              ? "border-amber-300/50 bg-linear-to-r from-black/75 via-[#6B4A3A]/70 to-black/75"
              : "border-white/20 bg-black/70",
          )}
        >
          {gift.senderImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gift.senderImage} alt="" className="size-7 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#6B4A3A] text-xs font-semibold text-white">
              {gift.senderName.charAt(0).toUpperCase() || "?"}
            </span>
          )}
          <span className="truncate">
            <strong>{gift.senderName}</strong> sent a{" "}
            <strong className="text-amber-300">{gift.giftName}</strong> to {hostName}!
          </span>
          {cost > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
              <Coins className="size-3" aria-hidden="true" />
              {cost.toLocaleString()}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── small components ───────────────────────── */

function StateOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-48 flex flex-col items-center justify-center gap-3 bg-black/70 p-4 text-center text-sm text-white backdrop-blur-md">
      {children}
    </div>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="size-7 shrink-0 rounded-full border border-white/20 object-cover" />
  ) : (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#6B4A3A] text-xs font-semibold text-white">
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function RoundBtn({
  label,
  onClick,
  disabled,
  danger,
  active,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-expanded={active}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-90 disabled:opacity-50",
        danger && "border-red-400/40 bg-red-600/80 hover:bg-red-600",
        active && "bg-white/25",
        className,
      )}
    >
      {children}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
  className,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        danger ? "text-red-300 hover:bg-red-500/20" : "text-white hover:bg-white/10",
        className,
      )}
    >
      <span className="shrink-0 opacity-90">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}