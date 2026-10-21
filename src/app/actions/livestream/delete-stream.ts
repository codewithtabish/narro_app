// src/app/actions/livestream/delete-stream.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { revalidateLiveStreams, revalidateUserActiveStream } from "@/lib/cache-keys";
import { deleteLiveKitRoom } from "@/lib/clients/livekit-client";
import prisma from "@/lib/clients/prisma-client";

const inputSchema = z.object({
  streamId: z.string().min(1, "streamId is required"),
});

export type DeleteStreamResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteLiveStream(
  input: z.infer<typeof inputSchema>,
): Promise<DeleteStreamResult> {
  try {
    /* ── 1. Auth ── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid stream ID." };
    const { streamId } = parsed.data;

    /* ── 2. Verify Ownership ── */
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
      select: { hostId: true, liveKitRoomName: true, host: { select: { clerkUserId: true } } },
    });

    if (!stream || stream.host.clerkUserId !== clerkUserId) {
      return { success: false, error: "Unauthorized. Only the host can delete this stream." };
    }

    /* ── 3. INSTANT CACHE CLEAR ── */
    revalidateLiveStreams();
    revalidateUserActiveStream(clerkUserId);
    
    // ✅ Your exact paths
    revalidatePath("/live-stream"); 
    revalidatePath(`/live-stream/${streamId}`); 

    /* ── 4. BACKGROUND TASK: Delete from DB & LiveKit ── */
    after(async () => {
      try {
        await deleteLiveKitRoom(stream.liveKitRoomName);
      } catch (err) {
        console.warn("[deleteLiveStream] LiveKit cleanup failed:", err);
      }

      try {
        await prisma.liveStream.delete({
          where: { id: streamId },
        });
        console.log(`[deleteLiveStream] Stream ${streamId} deleted from DB.`);
      } catch (err) {
        console.error("[deleteLiveStream] DB deletion failed:", err);
      }
    });

    /* ── 5. Return Instantly ── */
    return { success: true };
  } catch (err) {
    console.error("[deleteLiveStream] Error:", err);
    return { success: false, error: "Failed to delete stream." };
  }
}