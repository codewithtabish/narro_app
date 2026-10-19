// src/components/site/pages/rooms/room-card.tsx
"use client";

import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { RoomData } from "@/app/actions/rooms/get-rooms";
import { getLanguageFlag, getLanguageName } from "@/data/languages";

export function RoomCard({ room }: { room: RoomData }) {
  const hostAvatar = room.host.profileImageUrl ?? room.host.imageUrl;
  const hostInitial = room.host.name?.[0]?.toUpperCase() ?? "?";
  const flag = getLanguageFlag(room.language);
  const langName = getLanguageName(room.language);

  // ✅ Show up to 3 avatars, then "+X" for the rest
  const visibleParticipants = room.participants.slice(0, 3);
  const extraCount = room.participants.length - 3;

  return (
    <Link
      href={`/rooms/active/${room.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
          <span aria-hidden="true">{flag}</span> {langName}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-1">
        <h3 className="line-clamp-1 font-serif text-[22px] text-foreground">
          {room.title}
        </h3>
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <div className="relative h-5 w-5 overflow-hidden rounded-full bg-muted">
            {hostAvatar ? (
              <Image src={hostAvatar} alt={room.host.name} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-primary">
                {hostInitial}
              </span>
            )}
          </div>
          Hosted by {room.host.name.split(" ")[0]}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex items-center gap-3">
          
          {/* ✅ Stacked Avatars */}
          <div className="flex -space-x-2.5">
            {visibleParticipants.length > 0 ? (
              visibleParticipants.map((p, i) => (
                <div 
                  key={p.identity} 
                  className="relative h-7 w-7 rounded-full border-2 border-card bg-muted overflow-hidden shrink-0 shadow-sm"
                  style={{ zIndex: 10 - i }}
                >
                  {p.avatarUrl ? (
                    <Image src={p.avatarUrl} alt={p.name} fill className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-primary">
                      {p.name[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="h-7 w-7 rounded-full border-2 border-card bg-muted/50" />
            )}
            
            {extraCount > 0 && (
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground shrink-0 z-0">
                +{extraCount}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
            <Users size={16} /> Max {room.maxParticipants}
          </div>
        </div>

        <span className="inline-flex h-9 items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-5 text-[13px] font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          Join
        </span>
      </div>
    </Link>
  );
}