// src/app/community/active/[callId]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { getCall } from "@/app/actions/calls/get-call-action";
import { AutoAcceptClient } from "@/components/site/pages/community/calling/auto-accept-client";
import { CallRoom } from "@/components/site/pages/community/calling/call-room";
import { CallRoomSkeleton } from "@/components/site/pages/community/calling/call-room-skeleton";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type PageProps = {
  params: Promise<{ callId: string }>;
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PublicActiveCallPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CallRoomSkeleton />}>
      <ActiveCallLoader params={params} />
    </Suspense>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loader                                                                     */
/* -------------------------------------------------------------------------- */

async function ActiveCallLoader({ params }: { params: PageProps["params"] }) {
  /* ── Auth ──────────────────────────────────────────────── */
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect("/community");
  }

  const { callId } = await params;

  /* ── Load the call ─────────────────────────────────────── */
  const result = await getCall({ callId });
  if (!result.success) notFound();

  const call = result.call;

  /* ── Terminal states → redirect back to community ──────── */
  if (
    call.status === "ENDED" ||
    call.status === "REJECTED" ||
    call.status === "MISSED" ||
    call.status === "CANCELLED"
  ) {
    redirect("/community");
  }

  /* ── RINGING + receiver → client-side auto-accept ──────── */
  if (call.status === "RINGING" && call.myRole === "receiver") {
    return <AutoAcceptClient callId={callId} />;
  }

  /* ── RINGING + caller → waiting screen ─────────────────── */
  if (call.status === "RINGING" && call.myRole === "caller") {
    return <WaitingForAnswer callId={callId} />;
  }

  /* ── ACCEPTED → the room ───────────────────────────────── */
  return <CallRoom callId={callId} />;
}

/* -------------------------------------------------------------------------- */
/*  WaitingForAnswer — caller lands here before receiver accepts               */
/* -------------------------------------------------------------------------- */

async function WaitingForAnswer({ callId }: { callId: string }) {
  const call = await prisma.call.findUnique({
    where: { id: callId },
    select: {
      receiver: {
        select: {
          name: true,
          imageUrl: true,
          profileImageUrl: true,
        },
      },
    },
  });

  if (!call) notFound();

  const receiver = call.receiver;
  const avatar = receiver.profileImageUrl ?? receiver.imageUrl;
  const initial = receiver.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-6">
      
      {/* Background Gradient (Uses NARRO Primary token) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, var(--primary) 0%, transparent 60%)",
          opacity: 0.15,
        }}
      />

      {/* Pulsing avatar */}
      <div className="relative z-10 flex h-[180px] w-[180px] items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute h-[180px] w-[180px] animate-ping rounded-full bg-primary/20"
        />
        <span
          aria-hidden="true"
          className="absolute h-[160px] w-[160px] animate-pulse rounded-full bg-primary/30"
        />

        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={receiver.name}
            className="relative h-[140px] w-[140px] rounded-full border-4 border-background object-cover shadow-2xl"
          />
        ) : (
          <span className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full bg-muted font-serif text-4xl text-primary">
            {initial}
          </span>
        )}
      </div>

      <h1 className="z-10 font-serif text-3xl text-foreground">
        {receiver.name}
      </h1>

      <p className="z-10 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Ringing</span>
        <span aria-hidden="true" className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
        </span>
      </p>

      <p className="z-10 mt-8 text-[11px] italic text-muted-foreground/60">
        Waiting for {receiver.name.split(" ")[0]} to answer…
      </p>
    </div>
  );
}