// src/app/actions/rooms/request-speaker.ts
"use server";

import { revalidateSpeakerRequests } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";

export async function requestSpeaker(roomId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const me = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    if (!me) return { success: false, error: "User not found." };

    // ✅ Check if they already have a PENDING or APPROVED request
    const existingRequest = await prisma.roomSpeakerRequest.findUnique({
      where: { roomId_userId: { roomId, userId: me.id } },
    });

    if (existingRequest?.status === "PENDING") {
      return { success: true }; // Silently ignore duplicate clicks
    }

    // ✅ 1. Instantly clear the cache so the UI updates
    revalidateSpeakerRequests(roomId);

    // ✅ 2. Background DB write (Upsert prevents duplicates)
    after(async () => {
      try {
        await prisma.roomSpeakerRequest.upsert({
          where: { roomId_userId: { roomId, userId: me.id } },
          create: { roomId, userId: me.id, status: "PENDING" },
          update: { status: "PENDING" },
        });
      } catch (err) {
        console.error("[requestSpeaker] Background error:", err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[requestSpeaker] Error:", err);
    return { success: false, error: "Failed to request." };
  }
}