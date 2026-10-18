
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { getCall } from "@/app/actions/calls/get-call-action";
import { AutoAcceptClient } from "@/components/site/pages/community/calling/auto-accept-client";
import { CallRoom } from "@/components/site/pages/community/calling/call-room";
import { CallRoomSkeleton } from "@/components/site/pages/community/calling/call-room-skeleton";
import prisma from "@/lib/clients/prisma-client";

type PageProps = {
  params: Promise<{ callId: string }>;
};

export default function PublicActiveCallPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CallRoomSkeleton />}>
      <ActiveCallLoader params={params} />
    </Suspense>
  );
}

async function ActiveCallLoader({
  params,
}: {
  params: PageProps["params"];
}) {
  // Wait for an actual request before accessing Clerk authentication.
  await connection();

  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/community");
  }

  const { callId } = await params;

  // Load and authorize the call.
  const result = await getCall({ callId });

  if (!result.success) {
    notFound();
  }

  const call = result.call;

  // Redirect calls that are no longer active.
  if (
    call.status === "ENDED" ||
    call.status === "REJECTED" ||
    call.status === "MISSED" ||
    call.status === "CANCELLED"
  ) {
    redirect("/community");
  }

  // The receiver automatically accepts an incoming call.
  if (call.status === "RINGING" && call.myRole === "receiver") {
    return <AutoAcceptClient callId={callId} />;
  }

  // The caller waits until the receiver answers.
  if (call.status === "RINGING" && call.myRole === "caller") {
    return <WaitingForAnswer callId={callId} />;
  }

  // An accepted call opens the room.
  return <CallRoom callId={callId} />;
}

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

  if (!call) {
    notFound();
  }

  const receiver = call.receiver;
  const avatar = receiver.profileImageUrl ?? receiver.imageUrl;
  const initial = receiver.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6">
      {/* Background gradient */}
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
            alt={receiver.name ?? "Receiver"}
            className="relative h-[140px] w-[140px] rounded-full border-4 border-background object-cover shadow-2xl"
          />
        ) : (
          <span className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full bg-muted font-serif text-4xl text-primary">
            {initial}
          </span>
        )}
      </div>

      <h1 className="z-10 font-serif text-3xl text-foreground">
        {receiver.name ?? "Calling..."}
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
        Waiting for {receiver.name?.split(" ")[0] ?? "the receiver"} to answer…
      </p>
    </div>
  );
}
