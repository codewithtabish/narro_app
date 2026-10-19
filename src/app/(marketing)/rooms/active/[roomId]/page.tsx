// src/app/(marketing)/rooms/active/[roomId]/page.tsx
import { getRoomById } from "@/app/actions/rooms/get-room-by-id";
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
  
  if (!joinResult.success) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p>Failed to join: {joinResult.error}</p>
      </div>
    );
  }

  const me = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });
  
  const isHost = room.hostId === me?.id;

  return (
    <RoomWrapper
      token={joinResult.token}
      serverUrl={joinResult.liveKitUrl}
      roomId={roomId}
      roomTitle={room.title}
      isHost={isHost}
    />
  );
}