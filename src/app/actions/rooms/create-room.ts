// src/app/actions/rooms/create-room.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { z } from "zod";

import { revalidateRooms } from "@/lib/cache-keys";
import {
  createLiveKitRoom,
  generateCallRoomName,
} from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";
import { sendGlobalRoomPush } from "@/lib/push/send-global-room-push";

const inputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  language: z.string().min(2, "Language is required"),
  description: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  maxParticipants: z.number().min(2).max(20).default(10),
});

export type CreateRoomInput = z.infer<typeof inputSchema>;

export type CreateRoomResult =
  | { success: true; roomId: string }
  | { success: false; error: string };

export async function createRoom(
  input: CreateRoomInput,
): Promise<CreateRoomResult> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    const data = parsed.data;

    const host = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true, name: true },
    });
    if (!host) return { success: false, error: "User not found." };

    // 1. DB room (unique temp LiveKit name, safe even with a unique constraint)
    const room = await prisma.room.create({
      data: {
        hostId: host.id,
        title: data.title,
        description: data.description,
        language: data.language,
        visibility: data.visibility,
        maxParticipants: data.maxParticipants,
        liveKitRoomName: `pending-${crypto.randomUUID()}`,
        status: "OPEN",
      },
    });

    const liveKitRoomName = generateCallRoomName(room.id);

    // 2. LiveKit room
    try {
      await createLiveKitRoom({
        name: liveKitRoomName,
        emptyTimeout: 60 * 60, // 1 hour if empty
        maxParticipants: data.maxParticipants,
      });
    } catch (err) {
      console.error("[createRoom] LiveKit failed:", err);
      await prisma.room.delete({ where: { id: room.id } }).catch(() => {});
      return { success: false, error: "Failed to create audio room." };
    }

    // 3. Save the real LiveKit name
    await prisma.room.update({
      where: { id: room.id },
      data: { liveKitRoomName },
    });

    // 4. Revalidate NOW (after the final DB write, before returning),
    //    so the host never lands on a list that is missing the new room.
    revalidateRooms();

    // 5. Background: push notifications (slow, must never block the host)
    after(async () => {
      try {
        await sendGlobalRoomPush({
          roomId: room.id,
          title: room.title,
          hostName: host.name,
          language: room.language,
        });
      } catch (err) {
        console.error("[createRoom] Push failed:", err);
      }
    });

    return { success: true, roomId: room.id };
  } catch (err) {
    console.error("[createRoom] Error:", err);
    return { success: false, error: "Failed to create room." };
  }
}