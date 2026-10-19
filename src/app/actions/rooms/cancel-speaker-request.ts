// src/app/actions/rooms/cancel-speaker-request.ts
"use server";

import { revalidateSpeakerRequests } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";

export async function cancelSpeakerRequest(roomId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) return { success: false, error: "User not found." };

    // ✅ 1. Instantly clear the cache so the UI removes the chair
    revalidateSpeakerRequests(roomId);

    // ✅ 2. Background delete from DB
    after(async () => {
      try {
        await prisma.roomSpeakerRequest.deleteMany({
          where: { roomId, userId: me.id, status: "PENDING" },
        });
      } catch (err) {
        console.error("[cancelSpeakerRequest] Background error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[cancelSpeakerRequest] Error:", err);
    return { success: false, error: "Failed to cancel." };
  }
}