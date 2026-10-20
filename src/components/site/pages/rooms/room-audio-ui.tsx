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

/**
 * Page-level width WITHOUT horizontal padding:
 * keeps a 1rem gap on each side on phones, caps width on desktop.
 */
const SHELL_NARROW = "mx-auto w-[min(100%_-_2rem,56rem)]";
const SHELL_WIDE = "mx-auto w-[min(100%_-_2rem,72rem)]";
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
/*  Outer shell: owns the LiveKit connection                                  */
/* -------------------------------------------------------------------------- */

export function RoomAudioUI(props: RoomAudioUIProps) {
  const { token, serverUrl, roomId, initialRole } = props;
  const router = useRouter();
  const intentionalLeaveRef = useRef(false);
  const [deafened, setDeafened] = useState(false);

  const handleDisconnected = (reason?: DisconnectReason) => {
    if (intentionalLeaveRef.current) return;

    // Only react to server-side removals. LiveKitRoom already retries network drops.
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
      {/* Only visible if the browser blocks autoplay */}
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
  RoomEvent.Connected,
  RoomEvent.Reconnected,
  RoomEvent.ConnectionStateChanged,
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.ParticipantMetadataChanged,
  RoomEvent.ParticipantNameChanged,
  RoomEvent.ActiveSpeakersChanged,
  RoomEvent.TrackMuted,
  RoomEvent.TrackUnmuted,
  RoomEvent.TrackPublished,
  RoomEvent.TrackUnpublished,
  RoomEvent.LocalTrackPublished,
  RoomEvent.LocalTrackUnpublished,
];

/** All participants, re-rendering on every change that matters to the UI. */
function useRoomParticipants(): Participant[] {
  const room = useRoomContext();
  const [, force] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const handler = () => force();
    // Cast: one shared no-arg handler for many differently-typed events.
    PARTICIPANT_EVENTS.forEach((e) => room.on(e, handler as never));
    return () => {
      PARTICIPANT_EVENTS.forEach((e) => room.off(e, handler as never));
    };
  }, [room]);

  return [room.localParticipant, ...Array.from(room.remoteParticipants.values())];
}

/**
 * My live role, read straight from LiveKit (external store).
 * Changes the moment the host approves / removes me. No setState-in-effect.
 */
function useMyRole(initialRole: Role): Role {
  const room = useRoomContext();

  const subscribe = useCallback(
    (onChange: () => void) => {
      const local = room.localParticipant;
      local.on(ParticipantEvent.ParticipantMetadataChanged, onChange);
      room.on(RoomEvent.Connected, onChange);
      return () => {
        local.off(ParticipantEvent.ParticipantMetadataChanged, onChange);
        room.off(RoomEvent.Connected, onChange);
      };
    },
    [room],
  );

  const getSnapshot = useCallback(
    (): Role => parseRole(room.localParticipant.metadata) ?? initialRole,
    [room, initialRole],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => initialRole);
}

/* -------------------------------------------------------------------------- */
/*  Main content (inside LiveKit context)                                     */
/* -------------------------------------------------------------------------- */

function RoomContent({
  roomId,
  roomTitle,
  isHost,
  initialRole,
  pendingRequests,
  myPendingRequestId,
  intentionalLeaveRef,
  deafened,
  onToggleDeafen,
}: RoomAudioUIProps & {
  intentionalLeaveRef: React.MutableRefObject<boolean>;
  deafened: boolean;
  onToggleDeafen: () => void;
}) {
  const router = useRouter();
  const room = useRoomContext();
  const myRole = useMyRole(initialRole);

  const [isPending, setIsPending] = useState(false);
  const [dialogType, setDialogType] = useState<"leave" | "delete" | null>(null);
  const [hasRequested, setHasRequested] = useState(!!myPendingRequestId);
  const [liveRequests, setLiveRequests] = useState<SpeakerRequestItem[]>(pendingRequests);
  const [selected, setSelected] = useState<{ identity: string; name: string; role: Role } | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: Tone } | null>(null);

  // A raised hand only means something while I'm a listener
  const raised = hasRequested && myRole === "listener";

  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchSeq = useRef(0);
  const knownIds = useRef(new Set(pendingRequests.map((r) => r.id)));
  // Requests the host is acting on right now: never let a refetch resurrect them.
  const handledIds = useRef(new Set<string>());
  const prevRole = useRef<Role>(initialRole);

  const showNotice = useCallback((text: string, tone: Tone = "info") => {
    setNotice({ text, tone });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  /* ----------------------------- HOST: refetch ----------------------------- */

  const refetchRequests = useCallback(async () => {
    const seq = ++fetchSeq.current;
    try {
      const raw = await getSpeakerRequests(roomId);
      if (seq !== fetchSeq.current) return; // a newer fetch won

      const fresh = raw.filter((r) => !handledIds.current.has(r.id));
      const newcomers = fresh.filter((r) => !knownIds.current.has(r.id));
      knownIds.current = new Set(fresh.map((r) => r.id));

      if (newcomers.length > 0) {
        showNotice(
          newcomers.length === 1
            ? `${newcomers[0].name} raised a hand ✋`
            : `${newcomers.length} people raised their hands ✋`,
        );
        haptic();
      }
      setLiveRequests(fresh);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  }, [roomId, showNotice]);

  // Initial sync + resync on reconnect / tab focus (covers any missed signal). No polling.
  useEffect(() => {
    if (!isHost) return;

    // Deferred so no state is set during the effect body itself
    const initial = setTimeout(() => {
      void refetchRequests();
    }, 0);

    const onBack = () => void refetchRequests();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refetchRequests();
    };

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

  /* -------------------- Real-time signals from the server ------------------ */

  useEffect(() => {
    const onData = (
      payload: Uint8Array,
      participant?: unknown,
      _kind?: unknown,
      topic?: string,
    ) => {
      // Only trust signals sent by the server (no participant = server API)
      if (topic !== ROOM_SIGNAL_TOPIC || participant) return;
      const signal = decodeRoomSignal(payload);
      if (!signal) return;

      switch (signal.type) {
        case "REQUESTS_CHANGED":
          if (isHost) void refetchRequests();
          break;
        case "REQUEST_APPROVED":
        case "MOVED_TO_AUDIENCE":
          setHasRequested(false);
          break;
        case "REQUEST_DECLINED":
          setHasRequested(false);
          showNotice("The host declined your request.");
          break;
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, isHost, refetchRequests, showNotice]);

  /* ------------------ React to my own role changing live ------------------- */
  // Runs inside the LiveKit event callback (not in an effect body), so it can set state safely.

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
        showNotice("You're now a speaker 🎤", "success");
        haptic();
        local.setMicrophoneEnabled(true).catch(async () => {
          await sleep(700); // permission can land a beat after metadata
          try {
            await local.setMicrophoneEnabled(true);
          } catch {
            showNotice("You're a speaker. Tap the mic to unmute.");
          }
        });
      } else if (prev === "speaker" && next === "listener") {
        showNotice("You were moved to the audience.");
      }
    };

    local.on(ParticipantEvent.ParticipantMetadataChanged, onMetadata);
    return () => {
      local.off(ParticipantEvent.ParticipantMetadataChanged, onMetadata);
    };
  }, [room, showNotice]);

  /* ------------------------------ Page chrome ------------------------------ */

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  /* -------------------------------- Handlers ------------------------------- */

  const handleLeave = () => {
    setDialogType(null);
    setIsPending(true);
    intentionalLeaveRef.current = true;

    sessionStorage.setItem("room-toast", "You left the room.");
    room.disconnect().catch(() => {}); // others see you leave instantly
    leaveRoom({ roomId }).catch(console.error);
    router.push("/rooms");
    router.refresh();
  };

  const handleDeleteRoom = async () => {
    setDialogType(null);
    setIsPending(true);
    intentionalLeaveRef.current = true;

    const res = await deleteRoom({ roomId });
    if (res.success) {
      sessionStorage.setItem("room-toast", "You closed the room.");
      router.push("/rooms");
      router.refresh();
    } else {
      setIsPending(false);
      intentionalLeaveRef.current = false;
      showNotice(res.error ?? "Could not close the room.", "error");
    }
  };

  // GUEST: raise hand (instant)
  const handleRequestSpeaker = async () => {
    setHasRequested(true);
    haptic();
    const res = await requestSpeaker(roomId);
    if (!res.success) {
      setHasRequested(false);
      showNotice(res.error ?? "Could not send your request.", "error");
    }
  };

  // GUEST: cancel (instant)
  const handleCancelRequest = async () => {
    setHasRequested(false);
    const res = await cancelSpeakerRequest(roomId);
    if (!res.success) {
      setHasRequested(true);
      showNotice(res.error ?? "Could not cancel your request.", "error");
    }
  };

  // HOST: approve / decline (instant)
  const handleApproveRequest = async (
    req: SpeakerRequestItem,
    status: "APPROVED" | "DECLINED",
  ) => {
    handledIds.current.add(req.id); // refetches can't bring this card back
    knownIds.current.delete(req.id);
    setLiveRequests((prev) => prev.filter((r) => r.id !== req.id));
    haptic();
    showNotice(
      status === "APPROVED" ? `${req.name} can now speak` : `Declined ${req.name}`,
      status === "APPROVED" ? "success" : "info",
    );

    const res = await handleSpeakerRequest(req.id, status, roomId);
    if (!res.success) showNotice(res.error ?? "Could not update the request.", "error");

    handledIds.current.delete(req.id);
    void refetchRequests(); // settle on the server's truth (restores the card on failure)
  };

  // HOST: moderation (dialog closes instantly)
  const handleForceMute = async () => {
    if (!selected) return;
    const target = selected;
    setSelected(null);
    showNotice(`${target.name} was muted`, "success");
    const res = await muteParticipant({ roomId, participantIdentity: target.identity });
    if (!res.success) showNotice(res.error ?? "Could not mute.", "error");
  };

  const handleMoveToAudience = async () => {
    if (!selected) return;
    const target = selected;
    setSelected(null);
    showNotice(`${target.name} moved to the audience`);
    const res = await removeFromStage({ roomId, participantIdentity: target.identity });
    if (!res.success) showNotice(res.error ?? "Could not move this person.", "error");
  };

  const showRequestsRow = (isHost && liveRequests.length > 0) || (!isHost && raised);

  return (
    <>
      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute inset-x-0 top-0 z-20 bg-linear-to-b from-background to-transparent py-6"
      >
        <div className={cn(SHELL_WIDE, "relative flex items-center justify-between")}>
          <div className="font-serif text-[24px] sm:text-[28px] tracking-tight text-foreground">NARRO</div>
          <div className="absolute left-1/2 max-w-[45%] -translate-x-1/2 truncate text-base sm:text-xl font-medium text-foreground">
            {roomTitle}
          </div>

          {isHost && (
            <button
              onClick={() => setDialogType("delete")}
              disabled={isPending}
              aria-label="Delete room"
              className="flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500 backdrop-blur-md transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete Room</span>
            </button>
          )}
        </div>
      </motion.header>

      {/* Scrollable Center Area */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        {showRequestsRow && (
          <div className={cn(SHELL_NARROW, "flex flex-col items-center pt-24 pb-4")}>
            <span className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {isHost ? `Speaker Requests · ${liveRequests.length}` : "Waiting Room"}
            </span>

            {/* w-max + max-w-full + mx-auto: centered, and never clips when it overflows */}
            <div className="mx-auto flex w-max max-w-full gap-4 overflow-x-auto pb-4">
              <AnimatePresence mode="popLayout">
                {isHost &&
                  liveRequests.map((req) => (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex min-w-[100px] flex-col items-center gap-2 rounded-2xl border border-border bg-muted/50 p-3"
                    >
                      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#6B4A3A] font-serif text-lg text-white">
                        {req.avatarUrl ? (
                          <Image src={req.avatarUrl} alt={req.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          req.name[0]?.toUpperCase()
                        )}
                      </div>
                      <span className="w-20 truncate text-center text-xs font-medium text-foreground">{req.name}</span>
                      <div className="flex w-full gap-2">
                        <button
                          onClick={() => handleApproveRequest(req, "DECLINED")}
                          aria-label={`Decline ${req.name}`}
                          className="flex flex-1 items-center justify-center rounded-full bg-red-500/10 py-1.5 text-red-500 transition hover:bg-red-500/20 active:scale-95"
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => handleApproveRequest(req, "APPROVED")}
                          aria-label={`Approve ${req.name}`}
                          className="flex flex-1 items-center justify-center rounded-full bg-emerald-500/10 py-1.5 text-emerald-500 transition hover:bg-emerald-500/20 active:scale-95"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                {!isHost && raised && (
                  <motion.div
                    key="my-request"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex min-w-[100px] flex-col items-center gap-2 rounded-2xl border border-[#6B4A3A]/30 bg-[#6B4A3A]/10 p-3"
                  >
                    <div className="relative flex h-12 w-12 animate-pulse items-center justify-center overflow-hidden rounded-full bg-[#6B4A3A] font-serif text-lg text-white">
                      You
                    </div>
                    <span className="w-20 truncate text-center text-xs font-medium text-[#6B4A3A]">Hand raised ✋</span>
                    <button
                      onClick={handleCancelRequest}
                      className="flex w-full items-center justify-center rounded-full bg-red-500/10 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 active:scale-95"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <RoomStage
          isHost={isHost}
          topPadded={!showRequestsRow}
          onManage={(p) => setSelected(p)}
        />
      </div>

      {/* Bottom Dock */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 bg-linear-to-t from-background via-background/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-12"
      >
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.text}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
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

      {/* Host Moderation Dialog */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(DIALOG_WIDTH, "relative rounded-[24px] border border-border bg-card p-6 text-center shadow-2xl")}
            >
              <h3 className="font-serif text-xl text-card-foreground">Manage {selected.name}</h3>

              {selected.role === "speaker" ? (
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleForceMute}
                    className="flex items-center justify-center gap-2 rounded-full bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-500/20 active:scale-95"
                  >
                    <MicOff size={18} /> Force Mute
                  </button>
                  <button
                    onClick={handleMoveToAudience}
                    className="flex items-center justify-center gap-2 rounded-full bg-orange-500/10 px-6 py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-500/20 active:scale-95"
                  >
                    <Headphones size={18} /> Move to Audience
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  This person is in the audience. They can raise their hand to speak.
                </p>
              )}

              <button
                onClick={() => setSelected(null)}
                className="mt-4 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave / Delete Dialog */}
      <AnimatePresence>
        {dialogType && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isPending && setDialogType(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(DIALOG_WIDTH, "relative rounded-[24px] border border-border bg-card p-6 shadow-2xl")}
            >
              <h3 className="font-serif text-xl text-card-foreground">
                {dialogType === "leave" ? "Leave room?" : "Close room for everyone?"}
              </h3>
              <p className="mt-2 text-[14px] text-muted-foreground">
                {dialogType === "leave"
                  ? "You can always join back later. The conversation will continue without you."
                  : "This will permanently delete the room and disconnect all participants. This action cannot be undone."}
              </p>
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDialogType(null)}
                  disabled={isPending}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={dialogType === "leave" ? handleLeave : handleDeleteRoom}
                  disabled={isPending}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50",
                    dialogType === "leave" ? "bg-red-500 hover:bg-red-600" : "bg-red-600 hover:bg-red-700",
                  )}
                >
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
/*  Stage + Audience                                                          */
/* -------------------------------------------------------------------------- */

function RoomStage({
  isHost,
  topPadded,
  onManage,
}: {
  isHost: boolean;
  topPadded: boolean;
  onManage: (p: { identity: string; name: string; role: Role }) => void;
}) {
  const participants = useRoomParticipants();

  const entries = participants.map((p) => ({ p, ...parseMeta(p) }));
  const stage = entries
    .filter((e) => e.role !== "listener")
    .sort((a, b) => Number(b.role === "host") - Number(a.role === "host")); // host first
  const audience = entries.filter((e) => e.role === "listener");

  return (
    <div
      className={cn(
        SHELL_NARROW,
        "flex min-h-full flex-col items-center justify-center gap-12 pb-56",
        topPadded ? "pt-32" : "pt-4",
      )}
    >
      {stage.length > 0 && (
        <section className="flex w-full flex-col items-center gap-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            On stage · {stage.length}
          </span>
          <div className="grid w-full grid-cols-2 place-items-center gap-x-6 gap-y-10 sm:gap-x-12 sm:gap-y-16 md:grid-cols-3">
            <AnimatePresence>
              {stage.map(({ p, role, avatarUrl }) => (
                <ParticipantTile
                  key={p.identity}
                  p={p}
                  role={role}
                  avatarUrl={avatarUrl}
                  size="lg"
                  onManage={
                    isHost && !p.isLocal
                      ? () => onManage({ identity: p.identity, name: p.name || "User", role })
                      : undefined
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {audience.length > 0 && (
        <section className="flex w-full flex-col items-center gap-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Audience · {audience.length}
          </span>
          <div className="grid w-full grid-cols-3 place-items-center gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-5">
            <AnimatePresence>
              {audience.map(({ p, role, avatarUrl }) => (
                <ParticipantTile
                  key={p.identity}
                  p={p}
                  role={role}
                  avatarUrl={avatarUrl}
                  size="sm"
                  onManage={
                    isHost && !p.isLocal
                      ? () => onManage({ identity: p.identity, name: p.name || "User", role })
                      : undefined
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
}

function ParticipantTile({
  p,
  role,
  avatarUrl,
  size,
  onManage,
}: {
  p: Participant;
  role: Role;
  avatarUrl: string | null;
  size: "lg" | "sm";
  onManage?: () => void;
}) {
  const big = size === "lg";
  const isHostRole = role === "host";
  const onStage = role !== "listener";
  const isSpeaking = p.isSpeaking && p.isMicrophoneEnabled;
  const micOff = onStage && !p.isMicrophoneEnabled;
  const name = p.isLocal ? "You" : p.name || "Guest";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={cn("flex flex-col items-center gap-2.5", onManage && "cursor-pointer")}
      onClick={onManage}
      onKeyDown={(e) => {
        if (onManage && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onManage();
        }
      }}
      role={onManage ? "button" : undefined}
      tabIndex={onManage ? 0 : undefined}
      aria-label={onManage ? `Manage ${name}` : undefined}
    >
      <div className="relative isolate">
        {onStage && (
          <div
            className={cn(
              "absolute -inset-2 -z-10 rounded-full border-2 transition-colors",
              isSpeaking ? "border-[#10B981]" : "border-[#6B4A3A]",
            )}
          >
            {isSpeaking && (
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border-2 border-[#10B981]"
              />
            )}
          </div>
        )}

        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-full border-[3px] shadow-sm transition-all duration-300",
            big ? "h-24 w-24 sm:h-32 sm:w-32" : "h-16 w-16 sm:h-20 sm:w-20",
            isHostRole ? "border-[#FAF9F6]" : onStage ? "border-[#6B4A3A]" : "border-border",
          )}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              sizes={big ? "(max-width: 768px) 96px, 128px" : "80px"}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#6B4A3A] text-white">
              <span className={cn("font-serif font-medium", big ? "text-4xl sm:text-5xl" : "text-2xl")}>
                {p.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}
        </div>

        {isHostRole && (
          <div className="absolute -bottom-2 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background bg-[#6B4A3A] shadow-lg">
            <Crown size={12} className="text-[#FAF9F6]" />
          </div>
        )}

        {onStage && !isHostRole && (
          <div className="absolute bottom-0 right-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-md">
            {micOff ? (
              <MicOff size={12} className="text-red-500" />
            ) : (
              <Mic size={12} className="text-[#10B981]" />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <span
          className={cn(
            "max-w-24 truncate font-medium tracking-wide text-foreground sm:max-w-32",
            big ? "text-[14px] sm:text-[15px]" : "text-[12px]",
          )}
        >
          {name}
        </span>
        {onStage && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {isHostRole ? "Host" : "Speaker"}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Control Dock (mic state comes from LiveKit, so force-mute shows up)       */
/* -------------------------------------------------------------------------- */

function ControlDock({
  onLeave,
  isListener,
  deafened,
  onToggleDeafen,
}: {
  onLeave: () => void;
  isListener: boolean;
  deafened: boolean;
  onToggleDeafen: () => void;
}) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  // Optimistic value remembers the LiveKit state it started from (`base`).
  // The moment LiveKit's real state changes, the optimistic value is ignored
  // automatically. Pure derivation: no effect, no cascading renders.
  const [optimistic, setOptimistic] = useState<{ value: boolean; base: boolean } | null>(null);
  const busy = useRef(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const micOn =
    optimistic && optimistic.base === isMicrophoneEnabled
      ? optimistic.value
      : isMicrophoneEnabled;

  useEffect(
    () => () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    },
    [],
  );

  const toggleMic = async () => {
    if (isListener || !localParticipant || busy.current) return;
    busy.current = true;

    const next = !micOn;
    setOptimistic({ value: next, base: isMicrophoneEnabled }); // instant

    try {
      await localParticipant.setMicrophoneEnabled(next);
    } catch (err) {
      console.error("Mic toggle failed", err);
      setOptimistic(null); // snap back to LiveKit's truth
    } finally {
      busy.current = false;
      // Safety net: never leave a stale optimistic value behind
      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => setOptimistic(null), 1500);
    }
  };

  return (
    <div className="flex items-center gap-5 rounded-full border border-black/5 bg-white/70 px-5 py-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/50 sm:gap-6 sm:px-6 sm:py-4">
      <button
        onClick={toggleMic}
        disabled={isListener}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all duration-200 active:scale-95 sm:h-14 sm:w-14",
          isListener
            ? "cursor-not-allowed bg-neutral-200 opacity-50 dark:bg-neutral-800"
            : !micOn
              ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
        )}
      >
        {isListener || !micOn ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      <button
        onClick={onLeave}
        aria-label="Leave room"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
      >
        <PhoneOff size={26} />
      </button>

      <button
        onClick={onToggleDeafen}
        aria-label={deafened ? "Unmute room audio" : "Mute room audio"}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all duration-200 active:scale-95 sm:h-14 sm:w-14",
          deafened
            ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
        )}
      >
        {deafened ? <VolumeX size={22} /> : <Volume2 size={22} />}
      </button>
    </div>
  );
}