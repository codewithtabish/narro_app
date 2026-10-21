// src/components/site/pages/livestream/live-stream-player.tsx
"use client";

import type { StreamDetails } from "@/app/actions/livestream/get-stream-by-id";
import { joinLiveStream } from "@/app/actions/livestream/join-stream";
import { GIFTS } from "@/data/gifts";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, Eye, Gift, Loader2, MessageCircle, Mic, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LiveStreamPlayerProps {
  stream: StreamDetails;
  isHost: boolean;
  currentUser: {
    id: string;
    name: string;
    coinBalance: number;
  };
}

export function LiveStreamPlayer({ stream, isHost, currentUser }: LiveStreamPlayerProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ All UI States for the Layout
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [activeGift, setActiveGift] = useState<{ name: string; emoji: string; sender: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function getToken() {
      try {
        const res = await joinLiveStream({ streamId: stream.id });
        if (mounted) {
          if (res.success) setToken(res.token);
          else setError(res.error);
        }
      } catch (err) {
        if (mounted) setError("Failed to connect.");
      }
    }
    getToken();
    return () => { mounted = false; };
  }, [stream.id]);

  // ✅ Gift Handler (Simulated for now)
  const handleSendGift = (giftId: string) => {
    // TODO: Call your Server Action here to deduct coins & save transaction
    
    const gift = GIFTS.find(g => g.id === giftId);
    if (!gift) return;

    setIsGiftModalOpen(false);
    setActiveGift({ name: gift.name, emoji: gift.emoji, sender: currentUser.name });
    
    // Remove overlay after 4 seconds
    setTimeout(() => setActiveGift(null), 4000);
  };

  if (error) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-3xl bg-black text-white p-6 text-center">
        <p>{error}</p>
        <button onClick={() => router.push("/live-stream")} className="mt-4 text-sm text-red-400 underline">
          Go Back
        </button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-3xl bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    // ✅ NO page background, NO page horizontal padding. 
    // Relies on the parent <Container> in your layout.tsx
    <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6 relative">
      
      {/* ── LEFT: VIDEO PLAYER & CONTROLS ── */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-lg">
          
          {/* TOP OVERLAY HEADER */}
          <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-linear-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> LIVE
              </span>
              <h1 className="text-white font-medium text-lg drop-shadow-md hidden sm:block">
                {stream.title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium drop-shadow-md">
                <Eye size={16} /> 124
              </div>
              <button onClick={() => router.push("/live-stream")} className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* LIVEKIT VIDEO */}
          <LiveKitRoom
            video={isHost}
            audio={isHost}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: "100%" }}
            onDisconnected={() => setToken(null)}
          >
            <VideoConference />
          </LiveKitRoom>

          {/* BOTTOM LEFT HOST BADGE */}
          <div className="absolute bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-black/60 pl-1 pr-3 py-1 backdrop-blur-md border border-white/10">
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white">
              {stream.host.name[0]}
            </div>
            <span className="text-xs font-medium text-white">{stream.host.name}</span>
            <span className="rounded-full bg-[#6B4A3A] px-2 py-0.5 text-[10px] font-bold text-white">Host</span>
          </div>

          {/* FLOATING GIFT OVERLAY ANIMATION */}
          <AnimatePresence>
            {activeGift && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
              >
                <div className="absolute h-64 w-64 rounded-full bg-red-500/30 blur-3xl" />
                <div className="relative flex flex-col items-center gap-2 rounded-3xl border border-white/20 bg-black/40 px-6 py-4 backdrop-blur-md shadow-2xl">
                  <span className="text-6xl drop-shadow-xl animate-bounce">{activeGift.emoji}</span>
                  <div className="flex items-center gap-2 text-white">
                    <span className="font-bold">{activeGift.sender}</span>
                    <span className="text-sm text-white/80">sent a</span>
                    <span className="font-bold text-red-400">{activeGift.name}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTION CONTROLS (Mute, Gift, Chat) */}
        <div className="flex items-center justify-center gap-4 rounded-3xl border border-border bg-card p-2 sm:p-3 shadow-sm w-fit mx-auto">
          <button className="flex flex-col items-center justify-center h-12 w-12 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <Mic size={20} />
            <span className="text-[9px] font-medium mt-1">Mute</span>
          </button>
          
          {!isHost && (
            <button 
              onClick={() => setIsGiftModalOpen(true)}
              className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#6B4A3A] px-6 text-white hover:bg-[#5a3f31] transition-colors shadow-md"
            >
              <Gift size={20} />
              <span className="text-sm font-semibold">Send Gift</span>
            </button>
          )}

          <button className="flex flex-col items-center justify-center h-12 w-12 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <MessageCircle size={20} />
            <span className="text-[9px] font-medium mt-1">Chat</span>
          </button>
        </div>
      </div>

      {/* ── RIGHT: LIVE CHAT SIDEBAR ── */}
      <div className="w-full lg:w-[340px] shrink-0 h-[500px] lg:h-[calc(100vh-160px)] lg:sticky lg:top-24">
        <div className="flex h-full flex-col rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-4 bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Chat</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Mock Messages */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">User {i}</span>
                  <span className="text-[10px] text-muted-foreground">10:24</span>
                </div>
                <p className="text-sm text-foreground">Hello from Spain! 🇪🇸</p>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-border bg-background">
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 pl-4 pr-1 py-1">
              <input 
                type="text" 
                placeholder="Write a message..." 
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" 
              />
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6B4A3A] text-white hover:bg-[#5a3f31]">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── GIFT MODAL OVERLAY ── */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGiftModalOpen(false)} />
          
          <div className="relative w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Send a Gift</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Coins size={14} className="text-yellow-500" />
                  Balance: {currentUser.coinBalance} coins
                </p>
              </div>
              <button onClick={() => setIsGiftModalOpen(false)} className="p-2 rounded-full hover:bg-muted">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-h-[40vh] overflow-y-auto p-1">
              {GIFTS.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift.id)}
                  disabled={currentUser.coinBalance < gift.coinCost}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3 hover:border-[#6B4A3A] hover:bg-[#6B4A3A]/5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="text-3xl">{gift.emoji}</span>
                  <span className="text-xs font-medium text-foreground line-clamp-1">{gift.name}</span>
                  <span className="text-[10px] font-bold text-yellow-600 flex items-center gap-0.5">
                    <Coins size={10} /> {gift.coinCost}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}