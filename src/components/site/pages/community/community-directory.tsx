"use client";

import { SignUpButton } from "@clerk/nextjs";
import { LayoutGrid, List, Loader2, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { getCommunityUsers, type CommunityUser } from "@/app/actions/user/get-community-users";
import { getInterestEmoji, getInterestLabel } from "@/data/interests";
import { getLanguageName } from "@/data/languages";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
function formatSpeaks(user: CommunityUser, max: number) {
  return user.languagesSpoken.slice(0, max).map((c) => getLanguageName(c)).join(", ") || "—";
}
function formatLearning(user: CommunityUser, max: number) {
  return user.languagesLearning.slice(0, max).map((code) => {
      const level = user.proficiencyByLanguage?.[code];
      return level ? `${getLanguageName(code)} (${level.charAt(0)})` : getLanguageName(code);
    }).join(", ") || "—";
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
/* -------------------------------------------------------------------------- */
export function CommunityDirectory({ 
  initialUsers, 
  initialHasMore 
}: { 
  initialUsers: CommunityUser[], 
  initialHasMore: boolean 
}) {
  const [users, setUsers] = useState<CommunityUser[]>(initialUsers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  
  // Filter state (Only Available toggle)
  const [availableOnly, setAvailableOnly] = useState(true);
  
  // View state (grid vs list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Handle Filter Change
  const handleToggleAvailable = () => {
    const nextValue = !availableOnly;
    setAvailableOnly(nextValue);
    
    startTransition(async () => {
      // "available" is handled in the server action to filter by isAvailable: true
      const filter = nextValue ? "available" : "all";
      const result = await getCommunityUsers(1, filter);
      
      if (result.success) {
        setUsers(result.users);
        setHasMore(result.hasMore);
        setPage(1);
      }
    });
  };

  // Handle Load More
  const loadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const filter = availableOnly ? "available" : "all";
    
    const result = await getCommunityUsers(nextPage, filter);

    if (result.success) {
      setUsers((prev) => [...prev, ...result.users]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    }
    setIsLoadingMore(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Toolbar (Filter + View Toggle) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAvailable}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-all",
              availableOnly
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {availableOnly ? "Available to Call" : "Show Everyone"}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isPending ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-foreground">No learners found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-5",
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        )}>
          {users.map((user) => {
            const avatarUrl = user.profileImageUrl ?? user.imageUrl ?? null;
            const initial = user.name?.[0]?.toUpperCase() ?? "?";
            const firstName = user.name.split(" ")[0];

            return (
              <div
                key={user.id}
                className={cn(
                  "group relative flex overflow-hidden rounded-[24px] border border-border/60 bg-card transition-all duration-200 hover:shadow-md",
                  viewMode === "grid" ? "flex-col" : "flex-col sm:flex-row"
                )}
              >
                {/* Card Link Overlay */}
                <Link href={`/community/${user.clerkUserId}`} className="absolute inset-0 z-0" />

                {/* Image */}
                <div className={cn(
                  "relative bg-muted",
                  viewMode === "grid" ? "aspect-4/3 w-full" : "aspect-square w-full sm:w-[200px] shrink-0"
                )}>
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={user.name} fill sizes={viewMode === "grid" ? "(max-width: 768px) 100vw, 25vw" : "200px"} className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-4xl font-semibold text-primary">{initial}</span>
                  )}
                  
                  {/* Availability Dot */}
                  {user.isAvailable && (
                    <div className="absolute right-3 top-3 flex h-3 w-3 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={cn(
                  "relative z-10 flex flex-1 flex-col p-5 pointer-events-none",
                  viewMode === "list" && "justify-center"
                )}>
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-[17px] font-semibold text-foreground">{user.name}</h3>
                  </div>
                  
                  <dl className={cn(
                    "mt-3 flex gap-1.5 text-[13px]",
                    viewMode === "grid" ? "flex-col" : "flex-row flex-wrap"
                  )}>
                    <div className="flex items-baseline gap-2">
                      <dt className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Speaks</dt>
                      <dd className="truncate font-medium text-foreground">{formatSpeaks(user, 2)}</dd>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <dt className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Learning</dt>
                      <dd className="truncate font-medium text-foreground">{formatLearning(user, 2)}</dd>
                    </div>
                  </dl>

                  {user.bio && (
                    <>
                      <hr className="my-3 border-border/50" />
                      <p className="line-clamp-2 text-[13px] italic leading-relaxed text-muted-foreground">{user.bio}</p>
                    </>
                  )}

                  {user.interests.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {user.interests.slice(0, 2).map((id) => (
                        <span key={id} className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                          <span aria-hidden="true">{getInterestEmoji(id)}</span>
                          {getInterestLabel(id)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Call Button */}
                  <div className={cn(
                    "pointer-events-auto",
                    viewMode === "grid" ? "mt-auto pt-5" : "mt-4 pt-2"
                  )}>
                    <SignUpButton mode="modal" forceRedirectUrl={`/app/calls/${user.id}`} signInForceRedirectUrl={`/app/calls/${user.id}`}>
                      <button className="flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                        <Phone className="h-4 w-4" />
                        Call {firstName}
                      </button>
                    </SignUpButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isPending && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-8 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted disabled:opacity-50"
          >
            {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoadingMore ? "Loading..." : "Load more learners"}
          </button>
        </div>
      )}
    </div>
  );
}