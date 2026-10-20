// src/components/site/pages/rooms/room-audio-ui.tsx
"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DisconnectReason,
  type Participant,
  ParticipantEvent,
  RoomEvent,
} from "livekit-client";
import {
  Check, Crown, Hand, Headphones, Loader2, Lock, Mic, MicOff,
  PhoneOff, Trash2, Volume2, VolumeX, X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { handleSpeakerRequest } from "@/app/actions/rooms/approve-speaker";
import { cancelSpeakerRequest } from "@/app/actions/rooms/cancel-speaker-request";
import { deleteRoom } from "@/app/actions/rooms/delete-room";
import { getSpeakerRequests } from "@/app/actions/rooms/get-speaker-requests";
import { leaveRoom } from "@/app/actions/rooms/leave-room";
import { muteParticipant } from "@/app/actions/rooms/mute-participant";
import { removeFromStage } from "@/app/actions/rooms/remove-from-stage";
import { requestSpeaker } from "@/app/actions/rooms/request-speaker";
import {
  decodeRoomSignal,
  ROOM_SIGNAL_TOPIC,
  type SpeakerRequestItem,
} from "@/lib/rooms/room-events";
import { cn } from "@/lib/utils";

type Role = "host" | "speaker" | "listener";
type Tone = "info" | "success" | "error";

interface RoomAudioUIProps {
  token: string;
  serverUrl: string;
  roomId: string;
  roomTitle: string;
  isHost: boolean;
  initialRole: Role;
  pendingRequests: SpeakerRequestItem[];
  myPendingRequestId: string | null;
}

const DIALOG_WIDTH = "w-[min(100%_-_2rem,24rem)]";

const haptic = () => {
  try {
    navigator.vibrate?.(12);
  } catch {}
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseRole(metadata?: string): Role | null {
  try {
    if (metadata) {
      const r = JSON.parse(metadata)?.role;
      if (r === "host" || r === "speaker" || r === "listener") return r;
    }
  } catch {}
  return null;
}

function parseMeta(p: Participant): { role: Role; avatarUrl: string | null } {
  let avatarUrl: string | null = null;
  try {
    if (p.metadata) avatarUrl = JSON.parse(p.metadata)?.avatarUrl ?? null;
  } catch {}
  return { role: parseRole(p.metadata) ?? "listener", avatarUrl };
}

/* -------------------------------------------------------------------------- */
/*  Outer shell                                                               */
/* -------------------------------------------------------------------------- */

export function RoomAudioUI(props: RoomAudioUIProps) {
  const { token, serverUrl, roomId, initialRole } = props;
  const router = useRouter();
  const intentionalLeaveRef = useRef(false);
  const [deafened, setDeafened] = useState(false);

  const handleDisconnected = (reason?: DisconnectReason) => {
    if (intentionalLeaveRef.current) return;

    let message: string | null = null;
    if (reason === DisconnectReason.ROOM_DELETED) message = "The host closed the room.";
    else if (reason === DisconnectReason.PARTICIPANT_REMOVED) message = "You were removed from the room.";
    else if (reason === DisconnectReason.DUPLICATE_IDENTITY) message = "You joined this room from another device.";
    if (!message) return;

    intentionalLeaveRef.current = true;
    sessionStorage.setItem("room-toast", message);
    router.push("/rooms");
    router.refresh();
  };

  return (
    <LiveKitRoom
      key={`room-${roomId}`}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={initialRole !== "listener"}
      video={false}
      onDisconnected={handleDisconnected}
      className="fixed inset-0 z-9999 flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground"
    >
      <RoomContent
        {...props}
        intentionalLeaveRef={intentionalLeaveRef}
        deafened={deafened}
        onToggleDeafen={() => setDeafened((d) => !d)}
      />
      <RoomAudioRenderer volume={deafened ? 0 : 1} />
      <StartAudio
        label="Tap to enable audio"
        className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-full bg-[#6B4A3A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
      />
    </LiveKitRoom>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

const PARTICIPANT_EVENTS: RoomEvent[] = [
  RoomEvent.Connected, RoomEvent.Reconnected, RoomEvent.ConnectionStateChanged,
  RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected,
  RoomEvent.ParticipantMetadataChanged, RoomEvent.ParticipantNameChanged,
  RoomEvent.ActiveSpeakersChanged, RoomEvent.TrackMuted, RoomEvent.TrackUnmuted,
  RoomEvent.TrackPublished, RoomEvent.TrackUnpublished,
  RoomEvent.LocalTrackPublished, RoomEvent.LocalTrackUnpublished,
];

function useRoomParticipants(): Participant[] {
  const room = useRoomContext();
  const [, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const handler = () => force();
    PARTICIPANT_EVENTS.forEach((e) => room.on(e, handler as never));
    return () => { PARTICIPANT_EVENTS.forEach((e) => room.off(e, handler as never)); };
  }, [room]);
  return [room.localParticipant, ...Array.from(room.remoteParticipants.values())];
}

function useMyRole(initialRole: Role): Role {
  const room = useRoomContext();
  const subscribe = useCallback((onChange: () => void) => {
      const local = room.localParticipant;
      local.on(ParticipantEvent.ParticipantMetadataChanged, onChange);
      room.on(RoomEvent.Connected, onChange);
      return () => {
        local.off(ParticipantEvent.ParticipantMetadataChanged, onChange);
        room.off(RoomEvent.Connected, onChange);
      };
    }, [room]);
  const getSnapshot = useCallback((): Role => parseRole(room.localParticipant.metadata) ?? initialRole, [room, initialRole]);
  return useSyncExternalStore(subscribe, getSnapshot, () => initialRole);
}

/* -------------------------------------------------------------------------- */
/*  Main content                                                              */
/* -------------------------------------------------------------------------- */

function RoomContent({
  roomId, roomTitle, isHost, initialRole, pendingRequests, myPendingRequestId,
  intentionalLeaveRef, deafened, onToggleDeafen,
}: RoomAudioUIProps & { intentionalLeaveRef: React.MutableRefObject<boolean>; deafened: boolean; onToggleDeafen: () => void; }) {
  const router = useRouter();
  const room = useRoomContext();
  const myRole = useMyRole(initialRole);

  const [isPending, setIsPending] = useState(false);
  const [dialogType, setDialogType] = useState<"leave" | "delete" | null>(null);
  const [hasRequested, setHasRequested] = useState(!!myPendingRequestId);
  const [liveRequests, setLiveRequests] = useState<SpeakerRequestItem[]>(pendingRequests);
  const [selected, setSelected] = useState<{ identity: string; name: string; role: Role } | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: Tone } | null>(null);

  const raised = hasRequested && myRole === "listener";
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchSeq = useRef(0);
  const knownIds = useRef(new Set(pendingRequests.map((r) => r.id)));
  const handledIds = useRef(new Set<string>());
  const prevRole = useRef<Role>(initialRole);

  const showNotice = useCallback((text: string, tone: Tone = "info") => {
    setNotice({ text, tone });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  }, []);
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);

  const refetchRequests = useCallback(async () => {
    const seq = ++fetchSeq.current;
    try {
      const raw = await getSpeakerRequests(roomId);
      if (seq !== fetchSeq.current) return;
      const fresh = raw.filter((r) => !handledIds.current.has(r.id));
      const newcomers = fresh.filter((r) => !knownIds.current.has(r.id));
      knownIds.current = new Set(fresh.map((r) => r.id));
      if (newcomers.length > 0) {
        showNotice(newcomers.length === 1 ? `${newcomers[0].name} raised a hand ✋` : `${newcomers.length} people raised their hands ✋`);
        haptic();
      }
      setLiveRequests(fresh);
    } catch (err) { console.error("Failed to fetch requests", err); }
  }, [roomId, showNotice]);

  useEffect(() => {
    if (!isHost) return;
    const initial = setTimeout(() => { void refetchRequests(); }, 0);
    const onBack = () => void refetchRequests();
    const onVisible = () => { if (document.visibilityState === "visible") void refetchRequests(); };
    room.on(RoomEvent.Connected, onBack);
    room.on(RoomEvent.Reconnected, onBack);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(initial);
      room.off(RoomEvent.Connected, onBack);
      room.off(RoomEvent.Reconnected, onBack);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isHost, room, refetchRequests]);

  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: unknown, _kind?: unknown, topic?: string) => {
      if (topic !== ROOM_SIGNAL_TOPIC || participant) return;
      const signal = decodeRoomSignal(payload);
      if (!signal) return;
      switch (signal.type) {
        case "REQUESTS_CHANGED": if (isHost) void refetchRequests(); break;
        case "REQUEST_APPROVED": case "MOVED_TO_AUDIENCE": setHasRequested(false); break;
        case "REQUEST_DECLINED": setHasRequested(false); showNotice("The host declined your request."); break;
      }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => { room.off(RoomEvent.DataReceived, onData); };
  }, [room, isHost, refetchRequests, showNotice]);

  useEffect(() => {
    const local = room.localParticipant;
    const onMetadata = () => {
      const next = parseRole(local.metadata);
      if (!next) return;
      const prev = prevRole.current;
      prevRole.current = next;
      if (prev === next) return;
      setHasRequested(false);
      if (prev === "listener" && next === "speaker") {
        showNotice("You're now a speaker 🎤", "success"); haptic();
        local.setMicrophoneEnabled(true).catch(async () => {
          await sleep(700);
          try { await local.setMicrophoneEnabled(true); } catch { showNotice("You're a speaker. Tap the mic to unmute."); }
        });
      } else if (prev === "speaker" && next === "listener") {
        showNotice("You were moved to the audience.");
      }
    };
    local.on(ParticipantEvent.ParticipantMetadataChanged, onMetadata);
    return () => { local.off(ParticipantEvent.ParticipantMetadataChanged, onMetadata); };
  }, [room, showNotice]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleLeave = () => {
    setDialogType(null); setIsPending(true); intentionalLeaveRef.current = true;
    sessionStorage.setItem("room-toast", "You left the room.");
    room.disconnect().catch(() => {});
    leaveRoom({ roomId }).catch(console.error);
    router.push("/rooms"); router.refresh();
  };

  const handleDeleteRoom = async () => {
    setDialogType(null); setIsPending(true); intentionalLeaveRef.current = true;
    const res = await deleteRoom({ roomId });
    if (res.success) { sessionStorage.setItem("room-toast", "You closed the room."); router.push("/rooms"); router.refresh(); } 
    else { setIsPending(false); intentionalLeaveRef.current = false; showNotice(res.error ?? "Could not close the room.", "error"); }
  };

  const handleRequestSpeaker = async () => {
    setHasRequested(true); haptic();
    const res = await requestSpeaker(roomId);
    if (!res.success) { setHasRequested(false); showNotice(res.error ?? "Could not send request.", "error"); }
  };

  const handleCancelRequest = async () => {
    setHasRequested(false);
    const res = await cancelSpeakerRequest(roomId);
    if (!res.success) { setHasRequested(true); showNotice(res.error ?? "Could not cancel.", "error"); }
  };

  const handleApproveRequest = async (req: SpeakerRequestItem, status: "APPROVED" | "DECLINED") => {
    handledIds.current.add(req.id); knownIds.current.delete(req.id);
    setLiveRequests((prev) => prev.filter((r) => r.id !== req.id)); haptic();
    showNotice(status === "APPROVED" ? `${req.name} can now speak` : `Declined ${req.name}`, status === "APPROVED" ? "success" : "info");
    const res = await handleSpeakerRequest(req.id, status, roomId);
    if (!res.success) showNotice(res.error ?? "Could not update request.", "error");
    handledIds.current.delete(req.id); void refetchRequests();
  };

  const handleForceMute = async () => {
    if (!selected) return; const target = selected; setSelected(null);
    showNotice(`${target.name} was muted`, "success");
    const res = await muteParticipant({ roomId, participantIdentity: target.identity });
    if (!res.success) showNotice(res.error ?? "Could not mute.", "error");
  };

  const handleMoveToAudience = async () => {
    if (!selected) return; const target = selected; setSelected(null);
    showNotice(`${target.name} moved to the audience`);
    const res = await removeFromStage({ roomId, participantIdentity: target.identity });
    if (!res.success) showNotice(res.error ?? "Could not move.", "error");
  };

  return (
    <>
      {/* ✅ MINIMAL TOP BAR - Only Delete Icon for Host */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-4">
        <div className="font-serif text-xl tracking-tight text-foreground/50">NARRO</div>
        <div className="text-sm font-medium text-muted-foreground">{roomTitle}</div>
        {isHost ? (
          <button
            onClick={() => setDialogType("delete")}
            disabled={isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            title="Delete Room"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-10" /> // Spacer
        )}
      </div>

      {/* Main 3-Column Layout */}
      <div className="mt-14 flex flex-1 overflow-hidden">
        {/* Left Sidebar: Audience */}
        <aside className="hidden w-64 flex-col overflow-y-auto border-r border-border/50 p-4 md:flex custom-scrollbar">
          <AudienceSidebar />
        </aside>

        {/* Center: Stage (Scrollable) */}
        <main className="relative flex flex-1 flex-col overflow-y-auto custom-scrollbar p-6">
          <RoomStage isHost={isHost} onManage={(p) => setSelected(p)} />
        </main>

        {/* Right Sidebar: Requests */}
        <aside className="hidden w-72 flex-col overflow-y-auto border-l border-border/50 p-4 lg:flex custom-scrollbar">
          {isHost ? (
            <RequestsSidebar requests={liveRequests} onApprove={handleApproveRequest} />
          ) : (
            <MyRequestSidebar raised={raised} onCancel={handleCancelRequest} />
          )}
        </aside>
      </div>

      {/* Bottom Dock & Notices */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-3 bg-linear-to-t from-background via-background/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-12"
      >
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.text}
              initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
              role="status"
              className={cn(
                "max-w-[min(100%-2rem,24rem)] rounded-full border px-4 py-2 text-center text-[13px] font-medium shadow-lg",
                notice.tone === "error" && "border-red-500 bg-red-500 text-white",
                notice.tone === "success" && "border-emerald-500 bg-emerald-500 text-white",
                notice.tone === "info" && "border-border bg-card text-card-foreground",
              )}
            >
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>

        {myRole === "listener" && !raised && (
          <button
            onClick={handleRequestSpeaker}
            className="mb-2 flex items-center gap-2 rounded-full border border-[#6B4A3A] bg-background px-6 py-3 text-sm font-semibold text-[#6B4A3A] shadow-lg transition-all hover:bg-[#6B4A3A]/5 active:scale-95"
          >
            <Hand className="h-4 w-4" /> Raise Hand
          </button>
        )}

        <ControlDock
          onLeave={() => setDialogType("leave")}
          isListener={myRole === "listener"}
          deafened={deafened}
          onToggleDeafen={onToggleDeafen}
        />
        <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Lock size={12} /> Your voice is encrypted end-to-end.
        </p>
      </motion.div>

      {/* Dialogs */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={cn(DIALOG_WIDTH, "relative rounded-[24px] border border-border bg-card p-6 text-center shadow-2xl")}>
              <h3 className="font-serif text-xl text-card-foreground">Manage {selected.name}</h3>
              {selected.role === "speaker" ? (
                <div className="mt-6 flex flex-col gap-3">
                  <button onClick={handleForceMute} className="flex items-center justify-center gap-2 rounded-full bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-500/20 active:scale-95"><MicOff size={18} /> Force Mute</button>
                  <button onClick={handleMoveToAudience} className="flex items-center justify-center gap-2 rounded-full bg-orange-500/10 px-6 py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-500/20 active:scale-95"><Headphones size={18} /> Move to Audience</button>
                </div>
              ) : ( <p className="mt-4 text-sm text-muted-foreground">This person is in the audience.</p> )}
              <button onClick={() => setSelected(null)} className="mt-4 text-sm font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dialogType && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setDialogType(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={cn(DIALOG_WIDTH, "relative rounded-[24px] border border-border bg-card p-6 shadow-2xl")}>
              <h3 className="font-serif text-xl text-card-foreground">{dialogType === "leave" ? "Leave room?" : "Close room for everyone?"}</h3>
              <p className="mt-2 text-[14px] text-muted-foreground">{dialogType === "leave" ? "You can always join back later. The conversation will continue without you." : "This will permanently delete the room and disconnect all participants. This action cannot be undone."}</p>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={() => setDialogType(null)} disabled={isPending} className="rounded-full px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50">Cancel</button>
                <button onClick={dialogType === "leave" ? handleLeave : handleDeleteRoom} disabled={isPending} className={cn("flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50", dialogType === "leave" ? "bg-red-500 hover:bg-red-600" : "bg-red-600 hover:bg-red-700")}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {dialogType === "leave" ? "Leave Room" : "Close Room"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sidebars & Stage Components                                               */
/* -------------------------------------------------------------------------- */

function AudienceSidebar() {
  const participants = useRoomParticipants();
  const audience = participants.map((p) => ({ p, ...parseMeta(p) })).filter((e) => e.role === "listener");

  if (audience.length === 0) return null;

  return (
    <>
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Audience · {audience.length}
      </div>
      <div className="flex flex-col gap-3">
        {audience.map(({ p, avatarUrl }) => (
          <div key={p.identity} className="flex items-center gap-3">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border">
              {avatarUrl ? <Image src={avatarUrl} alt="avatar" fill className="object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-[#6B4A3A] text-xs text-white">{p.name?.[0]?.toUpperCase()}</div>}
            </div>
            <div className="flex flex-col">
              <span className="max-w-[120px] truncate text-sm font-medium text-foreground">{p.isLocal ? "You" : p.name}</span>
              <span className="text-[11px] text-muted-foreground">Listening</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RequestsSidebar({ requests, onApprove }: { requests: SpeakerRequestItem[]; onApprove: (req: SpeakerRequestItem, status: "APPROVED" | "DECLINED") => void; }) {
  return (
    <>
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6B4A3A]">
        Speaker Requests · {requests.length}
      </div>
      {requests.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center text-muted-foreground">
          <Hand className="mb-2 h-8 w-8 opacity-20" />
          <p className="text-sm font-medium text-foreground">No requests right now</p>
          <p className="mt-1 text-xs">When someone wants to speak, they&apos;ll appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <motion.div key={req.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                  {req.avatarUrl ? <Image src={req.avatarUrl} alt={req.name} fill className="object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-[#6B4A3A] text-sm text-white">{req.name[0]?.toUpperCase()}</div>}
                </div>
                <div className="flex flex-col">
                  <span className="max-w-[100px] truncate text-sm font-medium text-foreground">{req.name}</span>
                  <span className="text-[11px] text-muted-foreground">Wants to speak</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => onApprove(req, "DECLINED")} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95"><X size={16} /></button>
                <button onClick={() => onApprove(req, "APPROVED")} className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 active:scale-95"><Check size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

function MyRequestSidebar({ raised, onCancel }: { raised: boolean; onCancel: () => void }) {
  if (!raised) return null;
  return (
    <>
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Status</div>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[#6B4A3A]/30 bg-[#6B4A3A]/5 p-4 text-center">
        <div className="relative flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-[#6B4A3A] font-serif text-lg text-white">You</div>
        <span className="text-sm font-medium text-[#6B4A3A]">Hand raised ✋</span>
        <button onClick={onCancel} className="mt-1 w-full rounded-full bg-red-500/10 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 active:scale-95">Cancel Request</button>
      </div>
    </>
  );
}

function RoomStage({ isHost, onManage }: { isHost: boolean; onManage: (p: { identity: string; name: string; role: Role }) => void; }) {
  const participants = useRoomParticipants();
  const entries = participants.map((p) => ({ p, ...parseMeta(p) }));
  const stage = entries.filter((e) => e.role !== "listener").sort((a, b) => Number(b.role === "host") - Number(a.role === "host"));

  const count = stage.length;
  
  // ✅ Smaller, tightly packed grid
  const gridCols = count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";
  
  // ✅ Avatars are now universally smaller
  const avatarSize = count === 1 
    ? "h-32 w-32 sm:h-40 sm:w-40" 
    : count === 2 
      ? "h-24 w-24 sm:h-32 sm:w-32" 
      : "h-20 w-20 sm:h-24 sm:w-24";

  return (
    <div className="flex h-full min-h-full flex-col items-center justify-center py-6">
      {count > 0 ? (
        <div className="flex w-full flex-col items-center gap-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            On Stage · {count}
          </span>
          {/* ✅ Scrollable if too many people */}
          <div className={cn("grid w-full max-w-3xl place-items-center gap-x-6 gap-y-8", gridCols)}>
            <AnimatePresence>
              {stage.map(({ p, role, avatarUrl }) => (
                <ParticipantTile
                  key={p.identity}
                  p={p}
                  role={role}
                  avatarUrl={avatarUrl}
                  avatarSize={avatarSize}
                  onManage={isHost && !p.isLocal ? () => onManage({ identity: p.identity, name: p.name || "User", role }) : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No one is on stage yet.</p>
      )}
    </div>
  );
}

function ParticipantTile({ p, role, avatarUrl, avatarSize, onManage }: { p: Participant; role: Role; avatarUrl: string | null; avatarSize: string; onManage?: () => void; }) {
  const isHostRole = role === "host";
  const isSpeaking = p.isSpeaking && p.isMicrophoneEnabled;
  const micOff = !p.isMicrophoneEnabled;
  const name = p.isLocal ? "You" : p.name || "Guest";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={cn("flex flex-col items-center gap-2", onManage && "cursor-pointer")}
      onClick={onManage}
    >
      <div className="relative isolate">
        <div className={cn("absolute -inset-1.5 -z-10 rounded-full border-2 transition-colors", isSpeaking ? "border-[#10B981]" : "border-[#6B4A3A]")}>
          {isSpeaking && (
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 rounded-full border-2 border-[#10B981]" />
          )}
        </div>

        <div className={cn("relative flex items-center justify-center overflow-hidden rounded-full border-2 shadow-sm transition-all duration-300", avatarSize, isHostRole ? "border-[#FAF9F6]" : "border-[#6B4A3A]")}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill sizes="(max-width: 768px) 100vw, 256px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#6B4A3A] text-white">
              <span className="font-serif text-2xl font-medium sm:text-3xl">{p.name?.[0]?.toUpperCase() ?? "?"}</span>
            </div>
          )}
        </div>

        {isHostRole && (
          <div className="absolute -bottom-1.5 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background bg-[#6B4A3A] shadow-lg">
            <Crown size={10} className="text-[#FAF9F6]" />
          </div>
        )}

        {!isHostRole && (
          <div className="absolute bottom-0 right-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-md">
            {micOff ? <MicOff size={12} className="text-red-500" /> : <Mic size={12} className="text-[#10B981]" />}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <span className="max-w-[100px] truncate text-[13px] font-medium tracking-wide text-foreground">{name}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{isHostRole ? "Host" : "Speaker"}</span>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Control Dock                                                              */
/* -------------------------------------------------------------------------- */

function ControlDock({ onLeave, isListener, deafened, onToggleDeafen }: { onLeave: () => void; isListener: boolean; deafened: boolean; onToggleDeafen: () => void; }) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const [optimistic, setOptimistic] = useState<{ value: boolean; base: boolean } | null>(null);
  const busy = useRef(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micOn = optimistic && optimistic.base === isMicrophoneEnabled ? optimistic.value : isMicrophoneEnabled;

  useEffect(() => () => { if (clearTimer.current) clearTimeout(clearTimer.current); }, []);

  const toggleMic = async () => {
    if (isListener || !localParticipant || busy.current) return;
    busy.current = true;
    const next = !micOn;
    setOptimistic({ value: next, base: isMicrophoneEnabled });
    try { await localParticipant.setMicrophoneEnabled(next); } 
    catch (err) { console.error("Mic toggle failed", err); setOptimistic(null); } 
    finally {
      busy.current = false;
      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => setOptimistic(null), 1500);
    }
  };

  return (
    <div className="flex items-center gap-4 sm:gap-5 rounded-full border border-black/5 bg-white/70 px-4 py-2.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/50 sm:px-5 sm:py-3">
      <button onClick={toggleMic} disabled={isListener} className={cn("flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-all duration-200 active:scale-95 sm:h-12 sm:w-12", isListener ? "cursor-not-allowed bg-neutral-200 opacity-50 dark:bg-neutral-800" : !micOn ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700")}>
        {isListener || !micOn ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <button onClick={onLeave} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-16 sm:w-16">
        <PhoneOff size={24} />
      </button>

      <button onClick={onToggleDeafen} className={cn("flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-all duration-200 active:scale-95 sm:h-12 sm:w-12", deafened ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700")}>
        {deafened ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}