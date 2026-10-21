// src/app/actions/livestream/send-gift.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { after } from "next/server";
import { z } from "zod";

import { getGift } from "@/data/gifts";
import prisma from "@/lib/clients/prisma-client";
import { GiftEventPayload, LIVE_TOPICS } from "@/lib/livestream/live-stream-events";
import { allowAction, broadcastToRoom } from "@/lib/livestream/live-stream-server";

/** Share of the coin cost credited to the host's `earnedCoins`. Change here only. */
const RECEIVER_SHARE = 1;

const inputSchema = z.object({
  streamId: z.string().min(1, "streamId is required"),
  giftId: z.string().min(1, "giftId is required"),
});

export type SendGiftInput = z.infer<typeof inputSchema>;

export type SendGiftResult =
  | { success: true; newBalance: number }
  | { success: false; error: string; code?: "INSUFFICIENT_COINS" };

class GiftError extends Error {
  constructor(
    message: string,
    public code?: "INSUFFICIENT_COINS",
  ) {
    super(message);
  }
}

export async function sendGift(input: SendGiftInput): Promise<SendGiftResult> {
  try {
    /* ── 1. Auth ── */
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const { streamId, giftId } = parsed.data;

    // Stops double taps / scripts hammering the endpoint.
    if (!allowAction(`gift:${clerkUserId}`, 600)) {
      return { success: false, error: "Slow down a little and try again." };
    }

    /* ── 2. Price comes from the server catalog, never from the client ── */
    const gift = getGift(giftId);
    if (!gift) return { success: false, error: "This gift is not available." };

    /* ── 3. Load sender + stream ── */
    const [sender, stream] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true, name: true, imageUrl: true, profileImageUrl: true },
      }),
      prisma.liveStream.findUnique({
        where: { id: streamId },
        select: { id: true, status: true, hostId: true, liveKitRoomName: true },
      }),
    ]);

    if (!sender) return { success: false, error: "User not found." };
    if (!stream) return { success: false, error: "Stream not found." };
    if (stream.status !== "LIVE") return { success: false, error: "This stream has ended." };
    if (stream.hostId === sender.id) return { success: false, error: "You can't gift yourself." };

    /* ── 4. One atomic transaction: debit → credit → record ── */
    const credit = Math.floor(gift.coinCost * RECEIVER_SHARE);

    const result = await prisma.$transaction(async (tx) => {
      // Conditional debit: only succeeds if the balance is still enough.
      // Race-safe: two parallel requests can never overspend.
      const debit = await tx.user.updateMany({
        where: { id: sender.id, coinBalance: { gte: gift.coinCost } },
        data: { coinBalance: { decrement: gift.coinCost } },
      });
      if (debit.count === 0) {
        throw new GiftError("Not enough coins.", "INSUFFICIENT_COINS");
      }

      await tx.user.update({
        where: { id: stream.hostId },
        data: { earnedCoins: { increment: credit } },
      });

      const txn = await tx.giftTransaction.create({
        data: {
          senderId: sender.id,
          receiverId: stream.hostId,
          giftId: gift.id,
          streamId: stream.id,
          coinsSpent: gift.coinCost,
        },
        select: { id: true, createdAt: true },
      });

      const { coinBalance } = await tx.user.findUniqueOrThrow({
        where: { id: sender.id },
        select: { coinBalance: true },
      });

      return { txn, coinBalance };
    });

    /* ── 5. Background: tell the room + notify the host ── */
    after(async () => {
      const payload: GiftEventPayload = {
        id: result.txn.id,
        giftId: gift.id,
        giftName: gift.name,
        emoji: gift.emoji,
        senderName: sender.name,
        senderImage: sender.profileImageUrl ?? sender.imageUrl ?? null,
        createdAt: result.txn.createdAt.toISOString(),
      };

      await broadcastToRoom(stream.liveKitRoomName, LIVE_TOPICS.gift, payload);

      try {
        await prisma.notification.create({
          data: {
            userId: stream.hostId,
            type: "GIFT_RECEIVED",
            title: `${sender.name} sent you ${gift.emoji} ${gift.name}`,
            body: `+${credit} coins`,
            data: { streamId: stream.id, giftId: gift.id, senderId: sender.id },
          },
        });
      } catch (err) {
        console.warn("[sendGift] Notification failed:", err);
      }
    });

    /* ── 6. Return instantly ── */
    return { success: true, newBalance: result.coinBalance };
  } catch (err) {
    if (err instanceof GiftError) {
      return { success: false, error: err.message, code: err.code };
    }
    console.error("[sendGift] Error:", err);
    return { success: false, error: "Failed to send gift." };
  }
}