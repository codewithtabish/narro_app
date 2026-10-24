// src/components/site/pages/community/profile-view.tsx
"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { Globe, MapPin, MessageSquare, Phone, ShieldAlert, Star } from "lucide-react";
import Image from "next/image";

import { ReceiverUser } from "@/app/actions/user/get-receiver-user-action";
import { getInterestEmoji, getInterestLabel } from "@/data/interests";
import { getLanguageFlag, getLanguageName } from "@/data/languages";
import { MessageButton } from "../../general/chat/message-button";
import { CallButton } from "./calling/call-button";

export function ProfileView({ user }: { user: ReceiverUser }) {
  const { isSignedIn } = useAuth();

  const avatarUrl = user.profileImageUrl ?? user.imageUrl ?? null;
  const initial = user.name?.[0]?.toUpperCase() ?? "?";
  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col items-center">
      
      {/* ── MAIN CARD ── */}
      <div className="w-full overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-sm">
        
        {/* Cover Image */}
        <div className="relative h-[240px] w-full bg-muted sm:h-[320px]">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Cover" fill className="object-cover object-top" priority />
          ) : (
            <div className="h-full w-full bg-primary/10" />
          )}
        </div>

        {/* Avatar & Info */}
        <div className="relative flex flex-col items-center px-6 pb-8 text-center sm:px-10">
          <div className="relative -mt-16 mb-4 h-32 w-32 sm:-mt-20 sm:h-40 sm:w-40">
            <div className="h-full w-full overflow-hidden rounded-full border-[6px] border-card bg-muted shadow-sm">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={user.name} fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-5xl font-semibold text-primary">{initial}</span>
              )}
            </div>
            {user.isAvailable && !user.isBlocked && (
              <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center sm:bottom-4 sm:right-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-6 w-6 rounded-full bg-emerald-500 border-[3px] border-card" />
              </div>
            )}
          </div>

          <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] text-foreground sm:text-[44px]">{user.name}</h1>
          
          <div className="mt-2 flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>

          {user.bio && (
            <p className="mt-6 max-w-lg text-[15px] italic leading-relaxed text-muted-foreground">{user.bio}</p>
          )}
        </div>

        {/* Languages & Interests Grid */}
        <div className="mx-4 mb-4 grid grid-cols-1 gap-4 sm:mx-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 p-5">
            <div className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
              <Globe className="h-4 w-4" /> Speaks
            </div>
            <div className="flex flex-col gap-2">
              {user.languagesSpoken.map((code) => (
                <div key={code} className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/30 px-3 py-2">
                  <span className="text-[16px]">{getLanguageFlag(code)}</span>
                  <span className="text-[14px] font-medium text-foreground">{getLanguageName(code)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 p-5">
            <div className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
              <Star className="h-4 w-4" /> Learning
            </div>
            <div className="flex flex-col gap-2">
              {user.languagesLearning.map((code) => {
                const level = user.proficiencyByLanguage?.[code];
                return (
                  <div key={code} className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/30 px-3 py-2">
                    <span className="text-[16px]">{getLanguageFlag(code)}</span>
                    <span className="text-[14px] font-medium text-foreground">{getLanguageName(code)}</span>
                    {level && <span className="ml-auto text-[11px] font-semibold text-primary/70">({level})</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {user.interests.length > 0 && (
          <div className="mx-4 mb-8 rounded-2xl border border-border/60 p-5 sm:mx-8">
             <div className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
              <Star className="h-4 w-4" /> Interests
            </div>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((id) => (
                <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-[13px] font-medium text-primary">
                  <span aria-hidden="true">{getInterestEmoji(id)}</span>
                  {getInterestLabel(id)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div className="border-t border-border/60 bg-muted/10 p-6 sm:p-8">
          
          {user.isBlocked && (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-[13px] font-medium text-destructive">
              <ShieldAlert className="h-4 w-4" />
              You cannot call or message this user.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            
            {/* Call Button */}
            {user.isBlocked ? (
              <button disabled className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-muted px-6 py-4 text-[15px] font-semibold text-muted-foreground">
                <Phone className="h-5 w-5" /> Call Unavailable
              </button>
            ) : isSignedIn ? (
              <CallButton
                receiverId={user.id} 
                receiverClerkId={user.clerkUserId} 
                receiverName={user.name} 
                receiverAvatar={avatarUrl}
                className="flex-1"
              />
            ) : (
              <SignInButton mode="modal">
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-[15px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]">
                  <Phone className="h-5 w-5" /> Call {firstName}
                </button>
              </SignInButton>
            )}

            {/* ✅ Message Button - FIXED TO USE THE COMPONENT */}
            {user.isBlocked ? (
              <button disabled className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-6 py-4 text-[15px] font-semibold text-muted-foreground">
                <MessageSquare className="h-5 w-5" /> Message Unavailable
              </button>
            ) : isSignedIn ? (
              <MessageButton 
                receiverClerkId={user.clerkUserId}
                receiverName={user.name}
                receiverImage={avatarUrl}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-6 py-4 text-[15px] font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]">
                  <MessageSquare className="h-5 w-5" /> Message
                </button>
              </SignInButton>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}