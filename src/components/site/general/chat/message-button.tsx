// src/components/site/pages/community/message-button.tsx
"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { ChatModal } from "./chat-modal";
// ✅ FIXED IMPORT PATH: Pointing to the chat folder

export function MessageButton({ 
  receiverClerkId, 
  receiverName, 
  receiverImage 
}: { 
  receiverClerkId: string;
  receiverName: string;
  receiverImage: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button 
        type="button"
        onClick={handleOpen}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-6 py-4 text-[15px] font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98] cursor-pointer"
      >
        <MessageSquare className="h-5 w-5" /> Message
      </button>

      {/* The Modal is rendered here */}
      {isOpen && (
        <ChatModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          receiverClerkId={receiverClerkId}
          receiverName={receiverName}
          receiverImage={receiverImage}
        />
      )}
    </>
  );
}