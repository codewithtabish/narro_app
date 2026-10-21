// // src/components/livestream/live-stream-ui.tsx
// "use client";

// // ✅ Aliased the Gift type to GiftType to prevent conflict with the Lucide Gift icon
// import { GIFTS, type Gift as GiftType } from "@/data/gifts";
// import {
//     LiveKitRoom,
//     RoomAudioRenderer,
//     useDataChannel,
//     useLocalParticipant,
//     useTracks,
//     VideoTrack,
// } from "@livekit/components-react";
// import "@livekit/components-styles";
// import { AnimatePresence, motion } from "framer-motion";
// import { Track } from "livekit-client";
// import { Coins, Gift, Send, X } from "lucide-react"; // ✅ Gift icon is imported here
// import { useRouter } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import { sendGift } from "./send-gift";

// interface LiveStreamUIProps {
//   token: string;
//   serverUrl: string;
//   streamId: string;
//   isHost: boolean;
//   hostName: string;
//   hostImage: string | null;
//   currentUserBalance: number;
// }

// export function LiveStreamUI(props: LiveStreamUIProps) {
//   return (
//     <LiveKitRoom
//       token={props.token}
//       serverUrl={props.serverUrl}
//       connect={true}
//       video={props.isHost}
//       audio={props.isHost}
//       className="flex h-[calc(100vh-72px)] w-full flex-row overflow-hidden bg-background"
//     >
//       <StreamContent {...props} />
//       <RoomAudioRenderer />
//     </LiveKitRoom>
//   );
// }

// function StreamContent({
//   streamId,
//   isHost,
//   hostName,
//   currentUserBalance,
// }: LiveStreamUIProps) {
//   const router = useRouter();
//   const tracks = useTracks([Track.Source.Camera]);
//   const hostTrack = tracks.find((t) => t.participant.identity !== "local" || isHost);
  
//   const { localParticipant } = useLocalParticipant();
  
//   // ✅ 1. Chat State
//   const { send: sendChatMessage } = useDataChannel("chat");
//   const [messages, setMessages] = useState<{ id: string; sender: string; text: string }[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const chatEndRef = useRef<HTMLDivElement>(null);

//   // ✅ 2. Gifting State
//   const { send: sendGiftPacket } = useDataChannel("gifts"); // eslint-disable-line @typescript-eslint/no-unused-vars
//   const [activeGifts, setActiveGifts] = useState<{ id: string; emoji: string; left: number }[]>([]);
//   const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
//   const [balance, setBalance] = useState(currentUserBalance);

//   // Listen for Chat Messages
//   useDataChannel("chat", (msg) => {
//     const data = JSON.parse(new TextDecoder().decode(msg.payload));
//     if (data.type === "CHAT") {
//       setMessages((prev) => [...prev, { id: Math.random().toString(), sender: data.sender, text: data.text }]);
//     }
//   });

//   // Listen for Gifts
//   useDataChannel("gifts", (msg) => {
//     const data = JSON.parse(new TextDecoder().decode(msg.payload));
//     if (data.type === "GIFT") {
//       const id = Math.random().toString();
//       setActiveGifts((prev) => [...prev, { id, emoji: data.emoji, left: Math.random() * 80 }]);
//       setTimeout(() => setActiveGifts((prev) => prev.filter((g) => g.id !== id)), 3000);
//     }
//   });

//   // Auto-scroll chat
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendChat = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!chatInput.trim()) return;

//     const payload = new TextEncoder().encode(JSON.stringify({
//       type: "CHAT",
//       sender: localParticipant?.name || "Guest",
//       text: chatInput.trim(),
//     }));

//     sendChatMessage(payload, { reliable: true });
//     setChatInput("");
//   };

//   // ✅ FIXED: Using the aliased GiftType
//   const handleSendGift = async (gift: GiftType) => {
//     if (balance < gift.coinCost) return alert("Not enough coins!");
    
//     // Call the server action to deduct coins in DB
//     const res = await sendGift(streamId, gift.id);
//     if (res.success && res.newBalance !== undefined) {
//       setBalance(res.newBalance);
//       setIsGiftModalOpen(false);
//     }
//   };

//   return (
//     <div className="flex h-full w-full flex-row">
//       {/* ── LEFT: VIDEO PLAYER ── */}
//       <div className="relative flex flex-1 items-center justify-center bg-black">
//         {hostTrack ? (
//           <VideoTrack trackRef={hostTrack} className="h-full w-full object-contain" />
//         ) : (
//           <div className="text-white/50">Connecting to video...</div>
//         )}

//         {/* Floating Gifts */}
//         <AnimatePresence>
//           {activeGifts.map((gift) => (
//             <motion.div
//               key={gift.id}
//               initial={{ opacity: 0, y: 50, scale: 0.5 }}
//               animate={{ opacity: 1, y: -400, scale: 2 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 3, ease: "easeOut" }}
//               style={{ position: "absolute", bottom: 0, left: `${gift.left}%` }}
//               className="pointer-events-none z-50 text-6xl"
//             >
//               {gift.emoji}
//             </motion.div>
//           ))}
//         </AnimatePresence>

//         {/* Top Bar */}
//         <div className="absolute top-0 left-0 w-full flex items-center justify-between p-4 bg-linear-to-b from-black/60 to-transparent z-10">
//           <div className="flex items-center gap-3">
//             <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
//               <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> LIVE
//             </span>
//             <span className="text-white font-medium drop-shadow-md">{hostName}</span>
//           </div>
//           <button
//             onClick={() => router.push("/live-stream")}
//             className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
//           >
//             <X size={20} />
//           </button>
//         </div>
//       </div>

//       {/* ── RIGHT: CHAT & GIFT SIDEBAR ── */}
//       <div className="flex w-full max-w-[340px] flex-col border-l border-border bg-card">
        
//         {/* Header */}
//         <div className="flex items-center justify-between border-b border-border p-4">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Chat</h3>
//           <span className="text-xs text-muted-foreground">👁️ 124</span>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.length === 0 ? (
//             <p className="text-center text-xs text-muted-foreground">Say hello to the host!</p>
//           ) : (
//             messages.map((m) => (
//               <div key={m.id} className="flex flex-col gap-0.5">
//                 <span className="text-xs font-bold text-[#6B4A3A]">{m.sender}</span>
//                 <p className="text-sm text-foreground">{m.text}</p>
//               </div>
//             ))
//           )}
//           <div ref={chatEndRef} />
//         </div>

//         {/* Inputs */}
//         <div className="border-t border-border p-4 space-y-3">
//           <form onSubmit={handleSendChat} className="flex items-center gap-2">
//             <input
//               type="text"
//               value={chatInput}
//               onChange={(e) => setChatInput(e.target.value)}
//               placeholder="Write a message..."
//               className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-[#6B4A3A]"
//             />
//             <button type="submit" className="rounded-full bg-[#6B4A3A] p-2 text-white hover:bg-[#5a3f31]">
//               <Send size={16} />
//             </button>
//           </form>

//           {!isHost && (
//             <button
//               onClick={() => setIsGiftModalOpen(true)}
//               className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6B4A3A] py-2.5 font-semibold text-white shadow-lg transition-transform active:scale-95"
//             >
//               <Gift size={18} /> Send Gift
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── GIFT MODAL ── */}
//       {isGiftModalOpen && (
//         <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-4 sm:p-6">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGiftModalOpen(false)} />
//           <div className="relative w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h2 className="text-xl font-bold">Send a Gift</h2>
//                 <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
//                   <Coins size={14} className="text-yellow-500" /> Balance: {balance}
//                 </p>
//               </div>
//               <button onClick={() => setIsGiftModalOpen(false)} className="p-2 rounded-full hover:bg-muted">
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="grid grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto p-1">
//               {GIFTS.map((gift) => (
//                 <button
//                   key={gift.id}
//                   onClick={() => handleSendGift(gift)}
//                   disabled={balance < gift.coinCost}
//                   className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3 hover:border-[#6B4A3A] disabled:opacity-50"
//                 >
//                   <span className="text-3xl">{gift.emoji}</span>
//                   <span className="text-xs font-medium">{gift.name}</span>
//                   <span className="text-[10px] font-bold text-yellow-600 flex items-center gap-0.5">
//                     <Coins size={10} /> {gift.coinCost}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }