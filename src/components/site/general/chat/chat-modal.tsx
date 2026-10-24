// src/components/site/pages/chat/chat-modal.tsx
"use client";

import { getMessages, type ChatMessage } from "@/app/actions/chat/get-messages";
import { sendMessage } from "@/app/actions/chat/send-message";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCheck, Loader2, Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function ChatModal({ 
  isOpen, 
  onClose, 
  receiverClerkId, 
  receiverName, 
  receiverImage 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  receiverClerkId: string; 
  receiverName: string; 
  receiverImage: string | null;
}) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // 1. Initialize the chat room & fetch initial messages
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;

    async function init() {
      setIsLoading(true);
      
      // ✅ Pass undefined for chatId, and the receiverClerkId. 
      // The server action will find or create the chat and return the messages.
      const res = await getMessages(undefined, receiverClerkId);
      
      if (!mounted) return;
      
      if (res.success) {
        setChatId(res.chat.id);
        setMessages(res.messages);
      } else {
        console.error("[ChatModal] Failed to init chat:", res.error);
      }
      setIsLoading(false);
    }
    
    init();
    return () => { mounted = false; };
  }, [isOpen, receiverClerkId]);

  // 2. Poll for messages every 3 seconds (Real-time sync)
  useEffect(() => {
    if (!isOpen || !chatId) return;
    let mounted = true;

    const fetchMsgs = async () => {
      const res = await getMessages(chatId);
      if (res.success && mounted) {
        setMessages(res.messages);
      }
    };

    fetchMsgs(); // Initial fetch
    const interval = setInterval(fetchMsgs, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isOpen, chatId]);

  // Auto-scroll to the newest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Send Message with Optimistic UI
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msgText = text.trim();
    if (!msgText || !chatId || isSending) return;

    setText(""); // Clear input instantly
    setIsSending(true);

    // ✅ Optimistic UI: Show the message instantly
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      text: msgText,
      isMe: true,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await sendMessage({ chatId, text: msgText });
      
      if (!res.success) {
        // Rollback if failed
        setMessages((prev) => prev.filter(m => m.id !== tempId));
        setText(msgText);
      }
    } catch {
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setText(msgText);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-[#FAF9F6] dark:bg-[#121212] sm:h-[80vh] sm:rounded-3xl sm:shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-background/80 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="sm:hidden p-2 -ml-2 rounded-full hover:bg-muted">
              <ArrowLeft className="size-5" />
            </button>
            <div className="relative size-10 overflow-hidden rounded-full bg-muted shadow-sm">
              {receiverImage ? (
                <Image src={receiverImage} alt={receiverName} fill className="object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center font-semibold text-primary">{receiverName[0]}</span>
              )}
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold leading-tight text-foreground">{receiverName}</h2>
              <p className="text-[11px] text-emerald-500 font-medium">Online</p>
            </div>
          </div>
          <button onClick={onClose} className="hidden sm:flex p-2 rounded-full hover:bg-muted text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">Say hi to {receiverName.split(" ")[0]}!</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <span className="inline-block rounded-full bg-muted/50 px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Today
                </span>
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex w-full", msg.isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] shadow-sm",
                    msg.isMe 
                      ? "bg-[#6B4A3A] text-white rounded-br-sm" 
                      : "bg-white text-foreground rounded-bl-sm dark:bg-[#1E1E1E]"
                  )}>
                    {msg.text}
                    {msg.isMe && (
                      <div className="mt-1 flex justify-end">
                        <CheckCheck className="size-3 text-white/70" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} className="h-2" />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-background p-3 sm:p-4">
          <form onSubmit={handleSend} className="flex items-center gap-2 rounded-full border border-border bg-muted/30 pl-2 pr-1.5 py-1.5">
            <button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border">
              +
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Message ${receiverName.split(" ")[0]}...`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button 
              type="submit" 
              disabled={!text.trim() || isSending}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6B4A3A] text-white hover:bg-[#5a3f31] disabled:opacity-50 transition-colors"
            >
              {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 -ml-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}