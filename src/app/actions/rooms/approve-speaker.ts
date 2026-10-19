// src/app/actions/rooms/approve-speaker.ts
"use server";

import { revalidateSingleRoom, revalidateSpeakerRequests } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";

export async function handleSpeakerRequest(
  requestId: string,
  status: "APPROVED" | "DECLINED",
  roomId: string
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) return { success: false, error: "User not found." };

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { hostId: true },
    });
    if (room?.hostId !== me.id) {
      return { success: false, error: "Only the host can manage requests." };
    }

    // ✅ 1. Instantly update UI
    revalidateSpeakerRequests(roomId);
    revalidateSingleRoom(roomId);

    // ✅ 2. Background DB update
    after(async () => {
      try {
        await prisma.roomSpeakerRequest.update({
          where: { id: requestId },
          data: { status },
        });
      } catch (err) {
        console.error("[handleSpeakerRequest] Background error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[handleSpeakerRequest] Error:", err);
    return { success: false, error: "Failed to update request." };
  }
}