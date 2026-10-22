// src/app/live-stream/active/[streamId]/page.tsx
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { getStreamById } from "@/app/actions/livestream/get-stream-by-id";
import { joinLiveStream } from "@/app/actions/livestream/join-stream";
import { StreamRoom } from "@/components/site/pages/livestream/stream-room";
import { StreamRoomSkeleton } from "@/components/site/pages/livestream/stream-room-skeleton";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/clients/prisma-client";

interface PageProps {
  params: Promise<{ streamId: string }>;
}

export default function ActiveStreamPage({ params }: PageProps) {
  return (
    <Suspense fallback={<StreamRoomSkeleton />}>
      <ActiveStreamContent params={params} />
    </Suspense>
  );
}

async function ActiveStreamContent({ params }: PageProps) {
  // Force dynamic rendering so the room is always fresh
  await connection();

  const { streamId } = await params;

  const { userId: clerkUserId, redirectToSignIn } = await auth();
  if (!clerkUserId) return redirectToSignIn();

  const stream = await getStreamById(streamId);
  if (!stream) {
    return (
      <Notice
        title="This stream has ended"
        message="The host has finished broadcasting, or this link is no longer valid."
      />
    );
  }

  const [joined, me, hostFollowers] = await Promise.all([
    joinLiveStream({ streamId }),
    prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true, coinBalance: true },
    }),
    prisma.follow.count({ where: { followingId: stream.host.id } }),
  ]);

  if (!joined.success) {
    return <Notice title="Can't open this stream" message={joined.error} />;
  }
  if (!me) {
    return (
      <Notice
        title="Can't open this stream"
        message="Your account could not be found."
      />
    );
  }

  return (
    // Fully transparent – inherits layout background (light + dark mode)
    <div className="bg-transparent">
      <StreamRoom
        streamId={stream.id}
        title={stream.title}
        hostId={stream.host.id}
        hostName={stream.host.name}
        hostImage={stream.host.profileImageUrl ?? stream.host.imageUrl}
        hostFollowers={hostFollowers}
        currentUserId={me.id}
        token={joined.token}
        liveKitUrl={joined.liveKitUrl}
        isHost={joined.isHost}
        initialBalance={me.coinBalance}
      />
    </div>
  );
}

function Notice({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Button asChild>
        <Link href="/live-stream">Back to live streams</Link>
      </Button>
    </div>
  );
}