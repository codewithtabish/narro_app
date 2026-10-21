// src/components/livestream/create-stream-button.tsx
"use client";

import { getMyActiveStream } from "@/app/actions/livestream/get-my-active-stream";
import { Loader2, Radio, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateStreamDialog } from "./create-stream-dialog";

export function CreateStreamButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // ✅ Refetch on mount to ensure we don't get a stale ended stream
    getMyActiveStream()
      .then((res) => {
        if (mounted) {
          // ✅ Strict check: Only set ID if hasActiveStream is true
          setActiveStreamId(res.hasActiveStream ? res.streamId : null);
          setIsLoading(false);
        }
      })
      .catch(() => { 
        if (mounted) setIsLoading(false); 
      });
      
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return (
      <button disabled className="inline-flex h-12 w-40 items-center justify-center gap-2 rounded-full bg-muted px-6 text-sm font-semibold text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking...
      </button>
    );
  }

  if (activeStreamId) {
    return (
      <button
        onClick={() => {
          router.push(`/live-stream/active/${activeStreamId}`);
          router.refresh(); // ✅ Force refresh to clear any stale UI state
        }}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20"
      >
        <Radio size={18} /> Resume Stream
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#6B4A3A] px-6 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#5a3f31] active:scale-95"
      >
        <Video size={18} /> Go Live
      </button>
      <CreateStreamDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
}