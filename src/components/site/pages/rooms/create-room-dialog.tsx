// src/components/site/pages/rooms/create-room-dialog.tsx
"use client";

import { Check, ChevronsUpDown, Loader2, Mic, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createRoom } from "@/app/actions/rooms/create-room";
import { LANGUAGES } from "@/data/languages";
import { cn } from "@/lib/utils";

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomDialog({ isOpen, onClose }: CreateRoomDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("en");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [description, setDescription] = useState("");

  // Language Search State
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  const selectedLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  
  // Filter languages based on search input
  const filteredLanguages = LANGUAGES.filter((l) => {
    const q = langSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  }).slice(0, 50);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const result = await createRoom({
      title,
      language,
      maxParticipants,
      visibility,
      description,
    });

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    // ✅ Close the dialog BEFORE navigating to prevent the stuck state
    onClose();
    
    // ✅ Navigate to the active room
    router.push(`/rooms/active/${result.roomId}`);
  }

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-4 sm:p-6">
      
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-lg bg-background shadow-2xl flex flex-col",
          "animate-in slide-in-from-bottom-10 sm:zoom-in-95 sm:fade-in duration-300",
          "rounded-[32px]",
          "h-fit max-h-[85dvh]"
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-border sm:hidden" />

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1 custom-scrollbar">
          
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-[28px] leading-tight text-foreground">
                Start a conversation
              </h2>
              <p className="mt-1 text-[14px] text-muted-foreground">
                Open a room, invite others, and start speaking.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted active:scale-95 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <form id="create-room-form" onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Room Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Casual English Practice"
                maxLength={50}
                disabled={isSubmitting}
                required
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#6B4A3A] focus:ring-1 focus:ring-[#6B4A3A] disabled:opacity-50"
              />
            </div>

            {/* ── SEARCHABLE LANGUAGE SELECT ── */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Language
              </label>
              
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-background px-4 text-[15px] text-foreground outline-none transition-colors focus:border-[#6B4A3A] focus:ring-1 focus:ring-[#6B4A3A] disabled:opacity-50"
              >
                <span>
                  {selectedLang.flag} {selectedLang.name}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </button>

              {/* Dropdown Panel */}
              {isLangOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsLangOpen(false)} 
                  />
                  
                  <div className="absolute top-[70px] z-50 w-full overflow-hidden rounded-xl border border-border bg-background shadow-xl animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center border-b border-border px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        type="text"
                        placeholder="Search languages..."
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-[220px] overflow-y-auto p-1">
                      {filteredLanguages.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          No language found.
                        </p>
                      ) : (
                        filteredLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsLangOpen(false);
                              setLangSearch("");
                            }}
                            className="relative flex w-full cursor-default select-none items-center rounded-md py-2.5 pl-8 pr-2 text-sm outline-none hover:bg-muted focus:bg-muted"
                          >
                            {language === lang.code && (
                              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                            <span className="truncate">
                              {lang.flag} {lang.name}
                              {lang.nativeName !== lang.name && (
                                <span className="ml-2 text-muted-foreground opacity-70">
                                  ({lang.nativeName})
                                </span>
                              )}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* ──────────────────────────────── */}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Max Participants
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[2, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxParticipants(num)}
                    disabled={isSubmitting}
                    className={cn(
                      "h-12 rounded-xl border text-[15px] font-medium transition-all",
                      maxParticipants === num
                        ? "border-[#6B4A3A] bg-[#6B4A3A] text-white shadow-sm"
                        : "border-border bg-background text-foreground hover:bg-muted disabled:opacity-50"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility("PUBLIC")}
                  disabled={isSubmitting}
                  className={cn(
                    "flex h-12 items-center justify-center gap-2 rounded-xl border text-[15px] font-medium transition-all",
                    visibility === "PUBLIC"
                      ? "border-[#6B4A3A] bg-[#6B4A3A] text-white shadow-sm"
                      : "border-border bg-background text-foreground hover:bg-muted disabled:opacity-50"
                  )}
                >
                  <div className={cn("h-3 w-3 rounded-full border-2", visibility === "PUBLIC" ? "border-white bg-white" : "border-muted-foreground")} />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("PRIVATE")}
                  disabled={isSubmitting}
                  className={cn(
                    "flex h-12 items-center justify-center gap-2 rounded-xl border text-[15px] font-medium transition-all",
                    visibility === "PRIVATE"
                      ? "border-[#6B4A3A] bg-[#6B4A3A] text-white shadow-sm"
                      : "border-border bg-background text-foreground hover:bg-muted disabled:opacity-50"
                  )}
                >
                  <div className={cn("h-3 w-3 rounded-full border-2", visibility === "PRIVATE" ? "border-white bg-white" : "border-muted-foreground")} />
                  Private
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Let's practice job interview questions."
                maxLength={200}
                disabled={isSubmitting}
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background p-4 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[#6B4A3A] focus:ring-1 focus:ring-[#6B4A3A] disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="text-center text-[13px] font-medium text-destructive">
                {error}
              </p>
            )}
          </form>
        </div>

        <div className="shrink-0 p-6 sm:p-8 bg-background border-t border-border rounded-b-[32px]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              form="create-room-form"
              disabled={!title.trim() || isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#6B4A3A] px-8 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#5a3f31] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Room
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}