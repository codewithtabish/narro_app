// src/components/livestream/live-stream-list-card.tsx
"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Eye, Radio } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { LiveStreamData } from "@/app/actions/livestream/get-live-streams";

export function LiveStreamListCard({ stream }: { stream: LiveStreamData }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  const hostAvatar = stream.host.profileImageUrl ?? stream.host.imageUrl;
  const hostInitial = stream.host.name?.[0]?.toUpperCase() ?? "?";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const pendingStream = sessionStorage.getItem("pending-stream-id");
      if (pendingStream === stream.id) {
        sessionStorage.removeItem("pending-stream-id");
        router.push(`/live-stream/active/${stream.id}`);
      }
    }
  }, [isLoaded, isSignedIn, stream.id, router]);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (!isSignedIn) {
      sessionStorage.setItem("pending-stream-id", stream.id);
      openSignIn();
      return;
    }
    router.push(`/live-stream/active/${stream.id}`);
  };

  return (
    <div
      onClick={handleJoinClick}
      className="group flex cursor-pointer flex-col sm:flex-row items-center gap-5 overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-video w-full sm:w-64 shrink-0 overflow-hidden rounded-2xl bg-muted">
        {stream.thumbnailUrl ? (
          <Image
            src={stream.thumbnailUrl}
            alt={stream.title}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#6B4A3A] text-white">
            <span className="font-serif text-3xl">{stream.title[0]?.toUpperCase()}</span>
          </div>
        )}
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-[#E53935] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
        </div>
      </div>

      <div className="flex w-full flex-col justify-between py-1 sm:h-full">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3 className="line-clamp-1 font-serif text-xl text-foreground">
              {stream.title}
            </h3>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
              <Eye size={12} /> {stream.viewerCount}
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {stream.description || "Join the conversation!"}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-muted">
              {hostAvatar ? (
                <Image src={hostAvatar} alt={stream.host.name} fill sizes="24px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-primary">
                  {hostInitial}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {stream.host.name}
            </span>
          </div>
          <span className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#6B4A3A] px-5 text-xs font-semibold text-white transition-all group-hover:bg-[#5a3f31]">
            <Radio size={14} /> Join Stream
          </span>
        </div>
      </div>
    </div>
  );
}