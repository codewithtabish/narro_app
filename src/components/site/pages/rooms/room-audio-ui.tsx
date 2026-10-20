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
  Check,
  Crown,
  Hand,
  Headphones,
  Loader2,
  Lock,
  Mic,
  MicOff,
  PhoneOff,
  Trash2,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
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

const COCOA = "#6B4A3A";
const MOBILE_AUDIENCE_CAP = 36;

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
/*  Shared bits                                                               */
/* -------------------------------------------------------------------------- */

function Avatar({
  url,
  name,
  className,
  textClassName = "text-xs",
}: {
  url: string | null;
  name: string;
  className?: string;
  textClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-[#6B4A3A] text-white",
        className,
      )}
    >
      {url ? (
        <Image
          src={url}
          alt={name}
          fill
          sizes="160px"
          className="object-cover"
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center font-serif font-medium",
            textClassName,
          )}
        >
          {name?.[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </div>
  );
}

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-10000 flex items-end justify-center p-4 sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative mb-[env(safe-area-inset-bottom)] w-full max-w-sm rounded-[28px] border border-border bg-card p-6 shadow-2xl"
      >
        {children}
      </motion.div>
    </div>
  );
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
    if (reason === DisconnectReason.ROOM_DELETED)
      message = "The host closed the room.";
    else if (reason === DisconnectReason.PARTICIPANT_REMOVED)
      message = "You were removed from the room.";
    else if (reason === DisconnectReason.DUPLICATE_IDENTITY)
      message = "You joined this room from another device.";
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
        className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-[#6B4A3A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
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

function useRoomParticipants(): Participant[] {
  const room = useRoomContext();
  const [, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const handler = () => force();
    PARTICIPANT_EVENTS.forEach((e) => room.on(e, handler as never));
    return () => {
      PARTICIPANT_EVENTS.forEach((e) => room.off(e, handler as never));
    };
  }, [room]);
  return [
    room.localParticipant,
    ...Array.from(room.remoteParticipants.values()),
  ];
}

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
/*  Main content                                                              */
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
  const [liveRequests, setLiveRequests] =
    useState<SpeakerRequestItem[]>(pendingRequests);
  const [selected, setSelected] = useState<{
    identity: string;
    name: string;
    role: Role;
  } | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: Tone } | null>(
    null,
  );

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
  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const refetchRequests = useCallback(async () => {
    const seq = ++fetchSeq.current;
    try {
      const raw = await getSpeakerRequests(roomId);
      if (seq !== fetchSeq.current) return;
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

  useEffect(() => {
    if (!isHost) return;
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

  useEffect(() => {
    const onData = (
      payload: Uint8Array,
      participant?: unknown,
      _kind?: unknown,
      topic?: string,
    ) => {
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
          await sleep(700);
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

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleLeave = () => {
    setDialogType(null);
    setIsPending(true);
    intentionalLeaveRef.current = true;
    sessionStorage.setItem("room-toast", "You left the room.");
    room.disconnect().catch(() => {});
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

  const handleRequestSpeaker = async () => {
    setHasRequested(true);
    haptic();
    const res = await requestSpeaker(roomId);
    if (!res.success) {
      setHasRequested(false);
      showNotice(res.error ?? "Could not send request.", "error");
    }
  };

  const handleCancelRequest = async () => {
    setHasRequested(false);
    const res = await cancelSpeakerRequest(roomId);
    if (!res.success) {
      setHasRequested(true);
      showNotice(res.error ?? "Could not cancel.", "error");
    }
  };

  const handleApproveRequest = async (
    req: SpeakerRequestItem,
    status: "APPROVED" | "DECLINED",
  ) => {
    handledIds.current.add(req.id);
    knownIds.current.delete(req.id);
    setLiveRequests((prev) => prev.filter((r) => r.id !== req.id));
    haptic();
    showNotice(
      status === "APPROVED" ? `${req.name} can now speak` : `Declined ${req.name}`,
      status === "APPROVED" ? "success" : "info",
    );
    const res = await handleSpeakerRequest(req.id, status, roomId);
    if (!res.success)
      showNotice(res.error ?? "Could not update request.", "error");
    handledIds.current.delete(req.id);
    void refetchRequests();
  };

  const handleForceMute = async () => {
    if (!selected) return;
    const target = selected;
    setSelected(null);
    showNotice(`${target.name} was muted`, "success");
    const res = await muteParticipant({
      roomId,
      participantIdentity: target.identity,
    });
    if (!res.success) showNotice(res.error ?? "Could not mute.", "error");
  };

  const handleMoveToAudience = async () => {
    if (!selected) return;
    const target = selected;
    setSelected(null);
    showNotice(`${target.name} moved to the audience`);
    const res = await removeFromStage({
      roomId,
      participantIdentity: target.identity,
    });
    if (!res.success) showNotice(res.error ?? "Could not move.", "error");
  };

  const showRightRail = isHost || raised;

  return (
    <>
      {/* ------------------------------ Top bar ------------------------------ */}
      <TopBar
        title={roomTitle}
        isHost={isHost}
        isPending={isPending}
        onDelete={() => {
          setIsPending(false);
          setDialogType("delete");
        }}
      />

      {/* ------------------------------- Body -------------------------------- */}
      <div className="flex min-h-0 flex-1">
        <aside className="custom-scrollbar hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-border/50 p-4 md:flex">
          <AudienceSidebar />
        </aside>

        <main className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6">
          <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-8">
            <div className="flex flex-1 items-center justify-center">
              <RoomStage
                isHost={isHost}
                onManage={(p) => setSelected(p)}
              />
            </div>
            <div className="md:hidden">
              <AudienceStrip />
            </div>
          </div>
        </main>

        {showRightRail && (
          <aside className="custom-scrollbar hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border/50 p-4 lg:flex">
            {isHost ? (
              <RequestsSidebar
                requests={liveRequests}
                onApprove={handleApproveRequest}
              />
            ) : (
              <MyRequestSidebar raised={raised} onCancel={handleCancelRequest} />
            )}
          </aside>
        )}
      </div>

      {/* ------------------- Bottom dock (always in flow) -------------------- */}
      <div className="relative z-30 shrink-0 border-t border-border/40 bg-background/85 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        {/* floating notice */}
        <div className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center px-4 pb-3">
          <AnimatePresence>
            {notice && (
              <motion.div
                key={notice.text}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                role="status"
                className={cn(
                  "max-w-full rounded-full border px-4 py-2 text-center text-[13px] font-medium shadow-lg",
                  notice.tone === "error" && "border-red-500 bg-red-500 text-white",
                  notice.tone === "success" &&
                    "border-emerald-500 bg-emerald-500 text-white",
                  notice.tone === "info" &&
                    "border-border bg-card text-card-foreground",
                )}
              >
                {notice.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* host requests strip (below lg, where the right rail is hidden) */}
        {isHost && liveRequests.length > 0 && (
          <div className="mx-auto mb-3 w-full max-w-md lg:hidden">
            <div
              className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: COCOA }}
            >
              <Hand size={12} /> Requests · {liveRequests.length}
            </div>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {liveRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-1.5 shadow-sm"
                >
                  <Avatar
                    url={req.avatarUrl}
                    name={req.name}
                    className="h-7 w-7"
                    textClassName="text-[11px]"
                  />
                  <span className="max-w-[84px] truncate text-xs font-medium">
                    {req.name}
                  </span>
                  <button
                    aria-label={`Decline ${req.name}`}
                    onClick={() => handleApproveRequest(req, "DECLINED")}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-500 active:scale-90"
                  >
                    <X size={14} />
                  </button>
                  <button
                    aria-label={`Approve ${req.name}`}
                    onClick={() => handleApproveRequest(req, "APPROVED")}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 active:scale-90"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <ControlDock
            onLeave={() => {
              setIsPending(false);
              setDialogType("leave");
            }}
            isListener={myRole === "listener"}
            raised={raised}
            onToggleHand={raised ? handleCancelRequest : handleRequestSpeaker}
            deafened={deafened}
            onToggleDeafen={onToggleDeafen}
          />
          <p className="hidden items-center gap-1.5 text-[12px] text-muted-foreground [@media(min-height:620px)]:flex">
            <Lock size={11} /> Your voice is encrypted end-to-end.
          </p>
        </div>
      </div>

      {/* ----------------------------- Dialogs ------------------------------- */}
      <AnimatePresence>
        {selected && (
          <Modal onClose={() => setSelected(null)}>
            <div className="flex flex-col items-center text-center">
              <h3 className="font-serif text-xl text-card-foreground">
                Manage {selected.name}
              </h3>
              {selected.role === "speaker" ? (
                <div className="mt-5 flex w-full flex-col gap-2.5">
                  <button
                    onClick={handleForceMute}
                    className="flex items-center justify-center gap-2 rounded-full bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-600 transition hover:bg-amber-500/20 active:scale-95"
                  >
                    <MicOff size={18} /> Force Mute
                  </button>
                  <button
                    onClick={handleMoveToAudience}
                    className="flex items-center justify-center gap-2 rounded-full bg-orange-500/10 px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-500/20 active:scale-95"
                  >
                    <Headphones size={18} /> Move to Audience
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  This person is in the audience.
                </p>
              )}
              <button
                onClick={() => setSelected(null)}
                className="mt-4 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dialogType && (
          <Modal onClose={() => !isPending && setDialogType(null)}>
            <h3 className="font-serif text-xl text-card-foreground">
              {dialogType === "leave" ? "Leave room?" : "Close room for everyone?"}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {dialogType === "leave"
                ? "You can always join back later. The conversation will continue without you."
                : "This will permanently delete the room and disconnect all participants. This action cannot be undone."}
            </p>
            <div className="mt-7 flex items-center justify-end gap-2">
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
                className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-95 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {dialogType === "leave" ? "Leave Room" : "Close Room"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Top bar                                                                   */
/* -------------------------------------------------------------------------- */

function TopBar({
  title,
  isHost,
  isPending,
  onDelete,
}: {
  title: string;
  isHost: boolean;
  isPending: boolean;
  onDelete: () => void;
}) {
  const participants = useRoomParticipants();
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/40 bg-background/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <h1 className="truncate font-serif text-base font-medium sm:text-lg">
          {title}
        </h1>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
          <span className="mx-0.5">·</span>
          <Users size={11} /> {participants.length}
        </span>
      </div>
      {isHost && (
        <button
          onClick={onDelete}
          disabled={isPending}
          aria-label="Delete room"
          title="Delete room"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition hover:bg-red-500/20 active:scale-90 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Audience                                                                  */
/* -------------------------------------------------------------------------- */

function useAudience() {
  const participants = useRoomParticipants();
  return participants
    .map((p) => ({ p, ...parseMeta(p) }))
    .filter((e) => e.role === "listener");
}

/** Desktop / tablet sidebar. Scrolls, so 100+ listeners stay smooth. */
function AudienceSidebar() {
  const audience = useAudience();
  if (audience.length === 0)
    return (
      <p className="m-auto text-center text-xs text-muted-foreground">
        No listeners yet.
      </p>
    );

  return (
    <>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Audience · {audience.length}
      </div>
      <div className="flex flex-col gap-1">
        {audience.map(({ p, avatarUrl }) => (
          <div
            key={p.identity}
            className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5"
          >
            <Avatar
              url={avatarUrl}
              name={p.name || "?"}
              className="h-8 w-8 border border-border"
              textClassName="text-xs"
            />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
              {p.isLocal ? "You" : p.name || "Guest"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/** Phone: tiny avatar cloud, capped with a "+N" chip. */
function AudienceStrip() {
  const audience = useAudience();
  if (audience.length === 0) return null;
  const shown = audience.slice(0, MOBILE_AUDIENCE_CAP);
  const extra = audience.length - shown.length;

  return (
    <section>
      <div className="mb-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Audience · {audience.length}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {shown.map(({ p, avatarUrl }) => (
          <Avatar
            key={p.identity}
            url={avatarUrl}
            name={p.name || "?"}
            className="h-8 w-8 border border-border"
            textClassName="text-[11px]"
          />
        ))}
        {extra > 0 && (
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground">
            +{extra}
          </span>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Right rail                                                                */
/* -------------------------------------------------------------------------- */

function RequestsSidebar({
  requests,
  onApprove,
}: {
  requests: SpeakerRequestItem[];
  onApprove: (req: SpeakerRequestItem, status: "APPROVED" | "DECLINED") => void;
}) {
  return (
    <>
      <div
        className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: COCOA }}
      >
        Speaker Requests · {requests.length}
      </div>
      {requests.length === 0 ? (
        <p className="m-auto text-center text-xs text-muted-foreground">
          No raised hands right now.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar
                  url={req.avatarUrl}
                  name={req.name}
                  className="h-9 w-9"
                  textClassName="text-sm"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-medium">
                    {req.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Wants to speak
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  aria-label={`Decline ${req.name}`}
                  onClick={() => onApprove(req, "DECLINED")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-90"
                >
                  <X size={16} />
                </button>
                <button
                  aria-label={`Approve ${req.name}`}
                  onClick={() => onApprove(req, "APPROVED")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 active:scale-90"
                >
                  <Check size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

function MyRequestSidebar({
  raised,
  onCancel,
}: {
  raised: boolean;
  onCancel: () => void;
}) {
  if (!raised) return null;
  return (
    <>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Your Status
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#6B4A3A]/30 bg-[#6B4A3A]/5 p-4 text-center">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-[#6B4A3A] text-white">
          <Hand size={20} />
        </div>
        <span className="text-sm font-medium" style={{ color: COCOA }}>
          Hand raised ✋
        </span>
        <button
          onClick={onCancel}
          className="w-full rounded-full bg-red-500/10 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 active:scale-95"
        >
          Cancel Request
        </button>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stage                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Size tiers: tiles shrink automatically as more people join the stage,
 * so the layout stays clean from 1 speaker up to dozens.
 */
function getTier(count: number) {
  if (count <= 1)
    return {
      avatar: "h-28 w-28 sm:h-40 sm:w-40",
      label: "w-32 sm:w-44",
      name: "text-sm sm:text-base",
      text: "text-4xl sm:text-5xl",
      badge: "h-7 w-7",
      icon: 14,
      gap: "gap-x-6 gap-y-8",
    };
  if (count <= 4)
    return {
      avatar: "h-20 w-20 sm:h-28 sm:w-28",
      label: "w-24 sm:w-32",
      name: "text-[13px] sm:text-sm",
      text: "text-2xl sm:text-4xl",
      badge: "h-6 w-6",
      icon: 12,
      gap: "gap-x-4 gap-y-6 sm:gap-x-6",
    };
  if (count <= 9)
    return {
      avatar: "h-16 w-16 sm:h-20 sm:w-20",
      label: "w-20 sm:w-24",
      name: "text-xs sm:text-[13px]",
      text: "text-xl sm:text-2xl",
      badge: "h-5 w-5",
      icon: 11,
      gap: "gap-x-3 gap-y-5 sm:gap-x-5",
    };
  if (count <= 20)
    return {
      avatar: "h-12 w-12 sm:h-16 sm:w-16",
      label: "w-16 sm:w-20",
      name: "text-[11px] sm:text-xs",
      text: "text-lg sm:text-xl",
      badge: "h-4 w-4",
      icon: 9,
      gap: "gap-x-2.5 gap-y-4 sm:gap-x-4",
    };
  return {
    avatar: "h-10 w-10 sm:h-12 sm:w-12",
    label: "w-14 sm:w-16",
    name: "text-[10px] sm:text-[11px]",
    text: "text-base sm:text-lg",
    badge: "h-3.5 w-3.5",
    icon: 8,
    gap: "gap-x-2 gap-y-3 sm:gap-x-3",
  };
}

type Tier = ReturnType<typeof getTier>;

function RoomStage({
  isHost,
  onManage,
}: {
  isHost: boolean;
  onManage: (p: { identity: string; name: string; role: Role }) => void;
}) {
  const participants = useRoomParticipants();
  const stage = participants
    .map((p) => ({ p, ...parseMeta(p) }))
    .filter((e) => e.role !== "listener")
    .sort((a, b) => Number(b.role === "host") - Number(a.role === "host"));
  const count = stage.length;
  const tier = getTier(count);

  if (count === 0)
    return (
      <p className="text-sm text-muted-foreground">No one is on stage yet.</p>
    );

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        On Stage · {count}
      </span>
      <div className={cn("flex w-full flex-wrap justify-center", tier.gap)}>
        <AnimatePresence>
          {stage.map(({ p, role, avatarUrl }) => (
            <ParticipantTile
              key={p.identity}
              p={p}
              role={role}
              avatarUrl={avatarUrl}
              tier={tier}
              onManage={
                isHost && !p.isLocal
                  ? () =>
                      onManage({
                        identity: p.identity,
                        name: p.name || "User",
                        role,
                      })
                  : undefined
              }
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ParticipantTile({
  p,
  role,
  avatarUrl,
  tier,
  onManage,
}: {
  p: Participant;
  role: Role;
  avatarUrl: string | null;
  tier: Tier;
  onManage?: () => void;
}) {
  const isHostRole = role === "host";
  const isSpeaking = p.isSpeaking && p.isMicrophoneEnabled;
  const micOff = !p.isMicrophoneEnabled;
  const name = p.isLocal ? "You" : p.name || "Guest";

  return (
    <motion.button
      type="button"
      disabled={!onManage}
      onClick={onManage}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl outline-none",
        tier.label,
        onManage ? "cursor-pointer active:scale-95" : "cursor-default",
      )}
    >
      <div className="relative">
        <Avatar
          url={avatarUrl}
          name={name}
          className={cn(
            "ring-2 ring-offset-2 ring-offset-background transition-all duration-300",
            tier.avatar,
            isSpeaking ? "ring-[#10B981]" : "ring-[#6B4A3A]/70",
          )}
          textClassName={tier.text}
        />
        {isSpeaking && (
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-1 rounded-full border-2 border-[#10B981]"
          />
        )}
        {isHostRole && (
          <span
            className={cn(
              "absolute -left-0.5 -top-0.5 flex items-center justify-center rounded-full border-2 border-background bg-[#6B4A3A] shadow",
              tier.badge,
            )}
          >
            <Crown size={tier.icon} className="text-[#FAF9F6]" />
          </span>
        )}
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border border-border bg-background shadow",
            tier.badge,
          )}
        >
          {micOff ? (
            <MicOff size={tier.icon} className="text-red-500" />
          ) : (
            <Mic size={tier.icon} className="text-[#10B981]" />
          )}
        </span>
      </div>
      <div className="flex w-full flex-col items-center leading-tight">
        <span
          className={cn("w-full truncate text-center font-medium", tier.name)}
        >
          {name}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
          {isHostRole ? "Host" : "Speaker"}
        </span>
      </div>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Control Dock                                                              */
/* -------------------------------------------------------------------------- */

function ControlDock({
  onLeave,
  isListener,
  raised,
  onToggleHand,
  deafened,
  onToggleDeafen,
}: {
  onLeave: () => void;
  isListener: boolean;
  raised: boolean;
  onToggleHand: () => void;
  deafened: boolean;
  onToggleDeafen: () => void;
}) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const [optimistic, setOptimistic] = useState<{
    value: boolean;
    base: boolean;
  } | null>(null);
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
    setOptimistic({ value: next, base: isMicrophoneEnabled });
    try {
      await localParticipant.setMicrophoneEnabled(next);
    } catch (err) {
      console.error("Mic toggle failed", err);
      setOptimistic(null);
    } finally {
      busy.current = false;
      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => setOptimistic(null), 1500);
    }
  };

  const side =
    "flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all duration-200 active:scale-90 sm:h-14 sm:w-14";
  const neutral =
    "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700";
  const danger =
    "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400";

  return (
    <div className="flex items-center gap-4 rounded-full border border-black/5 bg-white/80 px-4 py-2.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/50 sm:gap-5 sm:px-5 sm:py-3">
      {isListener ? (
        <button
          onClick={onToggleHand}
          aria-label={raised ? "Lower hand" : "Raise hand"}
          aria-pressed={raised}
          className={cn(
            side,
            raised ? "bg-[#6B4A3A] text-white" : neutral,
            raised && "animate-pulse",
          )}
        >
          <Hand size={20} />
        </button>
      ) : (
        <button
          onClick={toggleMic}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          className={cn(side, micOn ? neutral : danger)}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
      )}

      <button
        onClick={onLeave}
        aria-label="Leave room"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-lg transition-transform hover:scale-105 active:scale-90 sm:h-16 sm:w-16"
      >
        <PhoneOff size={24} />
      </button>

      <button
        onClick={onToggleDeafen}
        aria-label={deafened ? "Turn sound on" : "Turn sound off"}
        aria-pressed={deafened}
        className={cn(side, deafened ? danger : neutral)}
      >
        {deafened ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}
