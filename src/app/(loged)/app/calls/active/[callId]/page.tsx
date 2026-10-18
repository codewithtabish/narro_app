// src/app/(loged)/app/calls/active/[callId]/page.tsx
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

export default function ActiveCallPage({ params }: PageProps) {
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
  if (!clerkUserId) redirect("/");

  const { callId } = await params;

  /* ── Load the call ─────────────────────────────────────── */
  const result = await getCall({ callId });
  if (!result.success) notFound();

  const call = result.call;

  /* ── Terminal states → redirect home ───────────────────── */
  if (
    call.status === "ENDED" ||
    call.status === "REJECTED" ||
    call.status === "MISSED" ||
    call.status === "CANCELLED"
  ) {
    redirect("/app/calls");
  }

  /* ── RINGING + receiver → client-side auto-accept ──────── */
  // Cannot call acceptCallAction here — revalidateTag is not
  // allowed during render in Next.js 16. Delegate to a client
  // component that calls the server action in an effect.
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
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#1a1613] px-6">
      {/* Pulsing avatar */}
      <div className="relative flex h-[180px] w-[180px] items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute h-[180px] w-[180px] animate-ping rounded-full bg-[#805039]/30"
        />
        <span
          aria-hidden="true"
          className="absolute h-[160px] w-[160px] animate-pulse rounded-full bg-[#805039]/15"
        />

        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={receiver.name}
            className="relative h-[140px] w-[140px] rounded-full border-2 border-white/20 object-cover shadow-2xl"
          />
        ) : (
          <span className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full bg-[#e9d9c9] font-serif text-4xl text-[#805039]">
            {initial}
          </span>
        )}
      </div>

      <h1 className="font-serif text-3xl text-[#FAF9F6]">{receiver.name}</h1>

      <p className="flex items-center gap-2 text-sm text-[#FAF9F6]/70">
        <span>Ringing</span>
        <span aria-hidden="true" className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80" />
        </span>
      </p>

      <p className="mt-8 text-[11px] italic text-[#FAF9F6]/40">
        Waiting for {receiver.name.split(" ")[0]} to answer…
      </p>
    </div>
  );
}