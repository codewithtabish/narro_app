// src/app/(marketing)/rooms/active/[roomId]/page.tsx
import { getRoomById } from "@/app/actions/rooms/get-room-by-id";
import { getSpeakerRequests } from "@/app/actions/rooms/get-speaker-requests";
import { joinRoom } from "@/app/actions/rooms/join-room";
import { RoomWrapper } from "@/components/site/pages/rooms/room-wrapper";
import prisma from "@/lib/clients/prisma-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export const instant = false;

export default async function ActiveRoomPage(props: {
  params: Promise<{ roomId: string }>;
}) {
  await connection();

  const params = await props.params;
  const roomId = params?.roomId;

  if (!roomId) redirect("/rooms");

  const { userId } = await auth();
  if (!userId) redirect("/rooms");

  const room = await getRoomById(roomId);
  if (!room) redirect("/rooms");

  const joinResult = await joinRoom({ roomId });
  
  // ✅ FIX: Type guard to ensure token and URL exist
  if (!joinResult.success || !joinResult.token || !joinResult.liveKitUrl) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p>Failed to join: {joinResult.error || "Missing token"}</p>
      </div>
    );
  }

  // ✅ 1. Fetch user to determine host/role
  const me = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  // ✅ Guard clause: If the user isn't in the DB yet, kick them back to rooms
  if (!me) {
    redirect("/rooms");
  }
  
  const isHost = room.hostId === me.id;

  const speakerRequest = await prisma.roomSpeakerRequest.findUnique({
    where: { roomId_userId: { roomId, userId: me.id } },
  });

  const isSpeaker = speakerRequest?.status === "APPROVED";
  const initialRole = isHost ? "host" : isSpeaker ? "speaker" : "listener";

  // ✅ 2. Fetch the Waiting Room queue
  const pendingRequests = await getSpeakerRequests(roomId);
  const myPendingRequestId = pendingRequests.find(r => r.userId === me.id)?.id || null;

  return (
    <RoomWrapper
      token={joinResult.token} // ✅ Now TypeScript knows this is a string
      serverUrl={joinResult.liveKitUrl} // ✅ Now TypeScript knows this is a string
      roomId={roomId}
      roomTitle={room.title}
      isHost={isHost}
      initialRole={initialRole}
      pendingRequests={isHost ? pendingRequests : []}
      myPendingRequestId={myPendingRequestId}
    />
  );
}