// src/components/site/pages/rooms/room-audio-ui.tsx
"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock, Mic, MicOff, PhoneOff, Trash2, Volume2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteRoom } from "@/app/actions/rooms/delete-room";
import { leaveRoom } from "@/app/actions/rooms/leave-room";
import { cn } from "@/lib/utils";

interface RoomAudioUIProps {
  token: string;
  serverUrl: string;
  roomId: string;
  roomTitle: string;
  isHost: boolean;
}

export function RoomAudioUI({ token, serverUrl, roomId, roomTitle, isHost }: RoomAudioUIProps) {
  const router = useRouter(); 
  const [isPending, setIsPending] = useState(false);
  const [dialogType, setDialogType] = useState<"leave" | "delete" | null>(null);

  const handleLeave = () => {
    setDialogType(null);
    setIsPending(true);
    
    sessionStorage.setItem("room-toast", "You left the room.");
    router.push("/rooms");
    router.refresh();

    leaveRoom({ roomId }).catch(console.error);
  };

  const handleDeleteRoom = async () => {
    setDialogType(null);
    setIsPending(true);

    const res = await deleteRoom({ roomId });
    
    if (res.success) {
      sessionStorage.setItem("room-toast", "You closed the room.");
      router.push("/rooms");
      router.refresh();
    } else {
      setIsPending(false);
      alert(res.error);
    }
  };

  const handleDisconnected = () => {
    if (!isPending) {
      sessionStorage.setItem("room-toast", "The host closed the room.");
    }
    router.push("/rooms");
    router.refresh();
  };

  return (
    <>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={handleDisconnected}
        className="fixed inset-0 z-100 flex h-dvh w-screen flex-col overflow-hidden bg-[#1A1613] text-[#FAF9F6]"
      >
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[800px] w-[800px] rounded-full bg-[#6B4A3A] opacity-20 blur-[120px]" />
        </div>

        {/* ✅ FIXED TOP HEADER: Absolute positioning to overlay scrolling content */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute top-0 left-0 right-0 z-20 flex w-full items-center justify-between px-6 py-6 sm:px-10 bg-linear-to-b from-[#1A1613] to-transparent"
        >
          <div className="font-serif text-[24px] sm:text-[28px] tracking-tight text-[#FAF9F6]">NARRO</div>
          <div className="absolute left-1/2 -translate-x-1/2 text-base sm:text-xl font-medium text-[#FAF9F6]">
            {roomTitle}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isHost && (
              <button
                onClick={() => setDialogType("delete")}
                disabled={isPending}
                className="flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 backdrop-blur-md transition-colors hover:bg-red-400/20 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete Room</span>
              </button>
            )}
          </div>
        </motion.header>

        {/* ✅ SCROLLABLE CENTER AREA: Padding top/bottom to clear header and dock */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex min-h-full items-center justify-center p-6 pt-32 pb-40">
            <AudioGrid />
          </div>
        </div>

        {/* ✅ FIXED BOTTOM DOCK: Absolute positioning, stays on top of scroll */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-4 bg-linear-to-t from-[#1A1613] via-[#1A1613]/80 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-12"
        >
          <ControlDock onLeave={() => setDialogType("leave")} />
          <p className="flex items-center gap-1.5 text-[13px] text-[#9B9691]">
            <Lock size={12} /> Your voice is encrypted end-to-end.
          </p>
        </motion.div>

        <RoomAudioRenderer />
      </LiveKitRoom>

      {/* Custom Delete/Leave Dialog */}
      <AnimatePresence>
        {dialogType && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
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
              className="relative w-full max-w-sm rounded-[24px] bg-[#2A2622] p-6 shadow-2xl border border-white/10"
            >
              <h3 className="text-xl font-serif text-[#FAF9F6]">
                {dialogType === "leave" ? "Leave room?" : "Close room for everyone?"}
              </h3>
              <p className="mt-2 text-[14px] text-[#9B9691]">
                {dialogType === "leave" 
                  ? "You can always join back later. The conversation will continue without you." 
                  : "This will permanently delete the room and disconnect all participants. This action cannot be undone."}
              </p>
              
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDialogType(null)}
                  disabled={isPending}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#FAF9F6] hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={dialogType === "leave" ? handleLeave : handleDeleteRoom}
                  disabled={isPending}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50",
                    dialogType === "leave" ? "bg-[#EF4444] hover:bg-red-600" : "bg-red-500 hover:bg-red-600"
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
/*  Audio Grid                                                                */
/* -------------------------------------------------------------------------- */

function AudioGrid() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 max-w-3xl w-full place-items-center">
      <AnimatePresence>
        {participants.map((p) => {
          const isSpeaking = p.isSpeaking;
          const isLocal = p.identity === localParticipant?.identity;
          
          let avatarUrl = null;
          try {
            if (p.metadata) {
              avatarUrl = JSON.parse(p.metadata).avatarUrl;
            }
          } catch {}

          return (
            <motion.div 
              key={p.identity}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -inset-4 rounded-full border-2 border-[#6B4A3A]"
                    style={{ zIndex: -1 }}
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border-2 border-[#6B4A3A]"
                    />
                  </motion.div>
                )}

                <div
                  className={cn(
                    // ✅ RESPONSIVE SIZING: Smaller on mobile (h-28), bigger on desktop (sm:h-40)
                    "relative flex h-28 w-28 sm:h-40 sm:w-40 items-center justify-center rounded-full border-[3px] transition-all duration-300 overflow-hidden shadow-xl",
                    isSpeaking 
                      ? "border-[#FAF9F6] shadow-[0_0_40px_rgba(107,74,58,0.8)]" 
                      : "border-[#FAF9F6]/20"
                  )}
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={p.name || "User"} fill sizes="(max-width: 768px) 100vw, 160px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#2A2622] text-4xl font-serif text-[#FAF9F6]">
                      {p.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
              </div>
              
              <span className="text-[15px] sm:text-[17px] font-medium text-[#FAF9F6] tracking-wide">
                {isLocal ? "You" : p.name || "Guest"}
              </span>
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

function ControlDock({ onLeave }: { onLeave: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);

  const toggleMic = async () => {
    if (!localParticipant) return;
    await localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-4 sm:gap-6 rounded-full bg-white/5 px-4 sm:px-8 py-3 sm:py-4 backdrop-blur-xl border border-white/10 shadow-2xl">
      <button
        onClick={toggleMic}
        className={cn(
          "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-200 active:scale-95",
          isMuted 
            ? "bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30" 
            : "bg-white/10 text-[#FAF9F6] hover:bg-white/20"
        )}
      >
        {isMuted ? <MicOff size={20} className="sm:w-[22px] sm:h-[22px]" /> : <Mic size={20} className="sm:w-[22px] sm:h-[22px]" />}
      </button>

      <button 
        onClick={onLeave}
        className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform hover:scale-105 active:scale-95"
      >
        <PhoneOff size={24} className="sm:w-[26px] sm:h-[26px]" />
      </button>

      <button className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/10 text-[#FAF9F6] hover:bg-white/20 transition-all duration-200 active:scale-95">
        <Volume2 size={20} className="sm:w-[22px] sm:h-[22px]" />
      </button>
    </div>
  );
}