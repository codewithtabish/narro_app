// src/components/site/pages/rooms/room-audio-ui.tsx
"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check, Crown, Hand, Headphones, Loader2, Lock, Mic, MicOff,
  MicOffIcon, PhoneOff, Trash2, Volume2, X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { handleSpeakerRequest } from "@/app/actions/rooms/approve-speaker";
import { cancelSpeakerRequest } from "@/app/actions/rooms/cancel-speaker-request";
import { deleteRoom } from "@/app/actions/rooms/delete-room";
import { leaveRoom } from "@/app/actions/rooms/leave-room";
import { muteParticipant } from "@/app/actions/rooms/mute-participant";
import { removeFromStage } from "@/app/actions/rooms/remove-from-stage";
import { requestSpeaker } from "@/app/actions/rooms/request-speaker";
import { useSpeakerRequests } from "@/hooks/use-speaker-requests"; // ✅ Bring back the hook
import { cn } from "@/lib/utils";

interface RoomAudioUIProps {
  token: string;
  serverUrl: string;
  roomId: string;
  roomTitle: string;
  isHost: boolean;
  initialRole: "host" | "speaker" | "listener";
  pendingRequests: { id: string; userId: string; name: string; avatarUrl: string | null }[];
  myPendingRequestId: string | null;
}

export function RoomAudioUI({ 
  token, serverUrl, roomId, roomTitle, isHost, initialRole, pendingRequests, myPendingRequestId 
}: RoomAudioUIProps) {
  const router = useRouter(); 
  const [isPending, setIsPending] = useState(false);
  const [dialogType, setDialogType] = useState<"leave" | "delete" | null>(null);
  const [hasRequested, setHasRequested] = useState(!!myPendingRequestId);
  const [selectedParticipant, setSelectedParticipant] = useState<{ identity: string; name: string } | null>(null);
  
  const intentionalLeaveRef = useRef(false);

  // ✅ THE FIX: Bring back the polling hook so the Host sees the guest's chair
  useSpeakerRequests(isHost);

  // Lock page scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Tab close prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleLeave = () => {
    setDialogType(null);
    setIsPending(true);
    intentionalLeaveRef.current = true; 
    
    sessionStorage.setItem("room-toast", "You left the room.");
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
      alert(res.error);
    }
  };

  const handleDisconnected = () => {
    if (intentionalLeaveRef.current) return;
    console.log("[RoomAudioUI] Disconnected unexpectedly. Reconnecting...");
  };

  const handleRequestSpeaker = async () => {
    setHasRequested(true);
    await requestSpeaker(roomId);
    router.refresh();
  };

  const handleCancelRequest = async () => {
    setHasRequested(false);
    await cancelSpeakerRequest(roomId);
    router.refresh();
  };

  return (
    <>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        audio={initialRole !== "listener"}
        video={false}
        onDisconnected={handleDisconnected}
        className="fixed inset-0 z-9999 flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground"
      >
        {/* Top Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute top-0 left-0 right-0 z-20 flex w-full items-center justify-between px-6 py-6 sm:px-10 bg-linear-to-b from-background to-transparent"
        >
          <div className="font-serif text-[24px] sm:text-[28px] tracking-tight text-foreground">NARRO</div>
          <div className="absolute left-1/2 -translate-x-1/2 text-base sm:text-xl font-medium text-foreground">
            {roomTitle}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isHost && (
              <button
                onClick={() => setDialogType("delete")}
                disabled={isPending}
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
          {/* WAITING ROOM ROW */}
          {((isHost && pendingRequests.length > 0) || (!isHost && hasRequested)) && (
            <div className="flex flex-col items-center pt-24 pb-4 px-4">
              <span className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                {isHost ? "Speaker Requests" : "Waiting Room"}
              </span>
              
              <div className="flex gap-4 overflow-x-auto w-full max-w-4xl justify-start sm:justify-center pb-4 px-2">
                {isHost && pendingRequests.map((req) => (
                  <motion.div 
                    key={req.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-2 bg-muted/50 p-3 rounded-2xl border border-border min-w-[100px]"
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[#6B4A3A] text-white flex items-center justify-center text-lg font-serif">
                      {req.avatarUrl ? (
                        <Image src={req.avatarUrl} alt={req.name} fill className="object-cover" />
                      ) : (
                        req.name[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-medium text-foreground truncate w-20 text-center">{req.name}</span>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={async () => await handleSpeakerRequest(req.id, "DECLINED", roomId)}
                        className="flex-1 flex items-center justify-center py-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={async () => await handleSpeakerRequest(req.id, "APPROVED", roomId)}
                        className="flex-1 flex items-center justify-center py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full hover:bg-emerald-500/20"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {!isHost && hasRequested && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-2 bg-[#6B4A3A]/10 p-3 rounded-2xl border border-[#6B4A3A]/30 min-w-[100px]"
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[#6B4A3A] text-white flex items-center justify-center text-lg font-serif animate-pulse">
                      You
                    </div>
                    <span className="text-xs font-medium text-[#6B4A3A] truncate w-20 text-center">Requesting...</span>
                    <button
                      onClick={handleCancelRequest}
                      className="w-full flex items-center justify-center py-1.5 bg-red-500/10 text-red-500 text-xs font-semibold rounded-full hover:bg-red-500/20"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className={cn("flex min-h-full items-center justify-center p-4 pb-56", (isHost && pendingRequests.length > 0) || hasRequested ? "pt-4" : "pt-32")}>
            <AudioGrid 
              isHost={isHost} 
              onSelectParticipant={(p) => setSelectedParticipant(p)} 
            />
          </div>
        </div>

        {/* Bottom Dock */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-4 bg-linear-to-t from-background via-background/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-12"
        >
          {initialRole === "listener" && !hasRequested && (
            <button
              onClick={handleRequestSpeaker}
              className="mb-2 flex items-center gap-2 rounded-full border border-[#6B4A3A] bg-background px-6 py-3 text-sm font-semibold text-[#6B4A3A] shadow-lg transition-all hover:bg-[#6B4A3A]/5"
            >
              <Hand className="h-4 w-4" /> Raise Hand
            </button>
          )}

          <ControlDock onLeave={() => setDialogType("leave")} isListener={initialRole === "listener"} />
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Lock size={12} /> Your voice is encrypted end-to-end.
          </p>
        </motion.div>

        <RoomAudioRenderer />
      </LiveKitRoom>

      {/* Host Moderation Dialog */}
      <AnimatePresence>
        {selectedParticipant && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedParticipant(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-[24px] bg-card p-6 shadow-2xl border border-border text-center"
            >
              <h3 className="text-xl font-serif text-card-foreground">
                Manage {selectedParticipant.name}
              </h3>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={async () => {
                    await muteParticipant({ roomId, participantIdentity: selectedParticipant.identity });
                    setSelectedParticipant(null);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-500/20 transition-colors"
                >
                  <MicOffIcon size={18} /> Force Mute
                </button>
                <button
                  onClick={async () => {
                    await removeFromStage({ roomId, participantIdentity: selectedParticipant.identity });
                    setSelectedParticipant(null);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-orange-500/10 px-6 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-500/20 transition-colors"
                >
                  <Headphones size={18} /> Move to Audience
                </button>
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="mt-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave / Delete Dialog */}
      <AnimatePresence>
        {dialogType && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
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
              className="relative w-full max-w-sm rounded-[24px] bg-card p-6 shadow-2xl border border-border"
            >
              <h3 className="text-xl font-serif text-card-foreground">
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
                    dialogType === "leave" ? "bg-red-500 hover:bg-red-600" : "bg-red-600 hover:bg-red-700"
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
/*  Audio Grid (With Roles & Badges)                                          */
/* -------------------------------------------------------------------------- */

function AudioGrid({ isHost, onSelectParticipant }: { isHost: boolean; onSelectParticipant: (p: { identity: string; name: string }) => void }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 sm:gap-x-12 sm:gap-y-16 max-w-4xl w-full place-items-center">
      <AnimatePresence>
        {participants.map((p) => {
          const isSpeaking = p.isSpeaking;
          const isLocal = p.identity === localParticipant?.identity;
          
          let avatarUrl = null;
          let role = "listener";
          try {
            if (p.metadata) {
              const meta = JSON.parse(p.metadata);
              avatarUrl = meta.avatarUrl;
              role = meta.role || "listener";
            }
          } catch {}

          const isSpeaker = role === "speaker" || role === "host";
          const isHostRole = role === "host";

          return (
            <motion.div 
              key={p.identity}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-3"
              onClick={() => {
                if (isHost && !isLocal) {
                  onSelectParticipant({ identity: p.identity, name: p.name || "User" });
                }
              }}
            >
              <div className="relative">
                {isSpeaker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "absolute -inset-2 rounded-full border-2",
                      isSpeaking ? "border-[#10B981]" : "border-[#6B4A3A]" 
                    )}
                    style={{ zIndex: -1 }}
                  >
                     {isSpeaking && (
                       <motion.div 
                         animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                         transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                         className="absolute inset-0 rounded-full border-2 border-[#10B981]"
                       />
                     )}
                  </motion.div>
                )}

                <div
                  className={cn(
                    "relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full border-[3px] transition-all duration-300 overflow-hidden shadow-sm",
                    isHostRole ? "border-[#FAF9F6]" 
                    : isSpeaker ? "border-[#6B4A3A]" 
                    : "border-border"
                  )}
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={p.name || "User"} fill sizes="(max-width: 768px) 100vw, 160px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#6B4A3A] text-white">
                      <span className="text-4xl sm:text-5xl font-serif font-medium">
                        {p.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}

                  {isHostRole && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#6B4A3A] border-2 border-background shadow-lg z-10">
                      <Crown size={12} className="text-[#FAF9F6]" />
                    </div>
                  )}

                  {role === "speaker" && (
                    <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-md">
                      <Mic size={12} className="text-[#10B981]" />
                    </div>
                  )}

                  {role === "listener" && (
                    <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-md">
                      <Headphones size={12} className="text-neutral-400" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-[14px] sm:text-[15px] font-medium text-foreground tracking-wide">
                  {isLocal ? "You" : p.name || "Guest"}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground capitalize">
                  {isHostRole ? "Host" : role}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Control Dock                                                              */
/* -------------------------------------------------------------------------- */

function ControlDock({ onLeave, isListener }: { onLeave: () => void; isListener: boolean }) {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(isListener);

  const toggleMic = async () => {
    if (isListener || !localParticipant) return;
    await localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-5 sm:gap-6 rounded-full bg-white/70 dark:bg-black/50 px-5 sm:px-6 py-3 sm:py-4 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xl">
      <button
        onClick={toggleMic}
        disabled={isListener}
        className={cn(
          "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-200 active:scale-95 shadow-sm",
          isListener ? "opacity-50 cursor-not-allowed bg-neutral-200 dark:bg-neutral-800" 
          : isMuted 
            ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" 
            : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        )}
      >
        {isMuted || isListener ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      <button 
        onClick={onLeave}
        className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <PhoneOff size={26} />
      </button>

      <button className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm transition-all duration-200 active:scale-95">
        <Volume2 size={22} />
      </button>
    </div>
  );
}