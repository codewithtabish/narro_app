// src/components/site/pages/rooms/create-room-dialog-wrapper.tsx
"use client";

import { Loader2, Plus, RadioReceiver } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { checkActiveRoom } from "@/app/actions/rooms/check-active-room";
import { CreateRoomDialog } from "./create-room-dialog";

export function CreateRoomDialogWrapper() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // ✅ Check if the user already has an active room on mount
  useEffect(() => {
    let mounted = true;
    checkActiveRoom()
      .then((res) => {
        if (mounted) {
          setActiveRoomId(res.roomId);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 1. Loading state
  if (isLoading) {
    return (
      <button
        disabled
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-muted px-6 text-[15px] font-semibold text-muted-foreground"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking...
      </button>
    );
  }

  // 2. Active room exists -> Resume Room
  if (activeRoomId) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/rooms/active/${activeRoomId}`)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 text-[15px] font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 active:scale-95"
      >
        <RadioReceiver size={18} />
        Resume Room
      </button>
    );
  }

  // 3. No active room -> Create Room
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#6B4A3A] px-6 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#5a3f31] active:scale-95"
      >
        <Plus size={18} />
        Create Room
      </button>

      <CreateRoomDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}