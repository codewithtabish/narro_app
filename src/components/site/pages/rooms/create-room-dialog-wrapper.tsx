// src/components/site/pages/rooms/create-room-dialog-wrapper.tsx
"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateRoomDialog } from "./create-room-dialog";

export function CreateRoomDialogWrapper() {
  const [isOpen, setIsOpen] = useState(false);

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