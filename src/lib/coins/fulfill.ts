import prisma from "../clients/prisma-client";

/**
 * Marks a purchase PAID and adds the coins, exactly once.
 * Safe to call any number of times (webhook retries, success page, both at once):
 * only the call that flips the status credits the user.
 *
 * FAILED is claimable too, so a late payment that arrives after we gave up on a
 * stale purchase still gets the buyer their coins.
 */
export async function fulfillCoinPurchase(
  trackerId: string,
): Promise<{ found: boolean; credited: boolean }> {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.coinPurchase.findUnique({
      where: { safepayTrackerId: trackerId },
      select: { id: true, userId: true, coinsAdded: true },
    });
    if (!purchase) return { found: false, credited: false };

    const claimed = await tx.coinPurchase.updateMany({
      where: { id: purchase.id, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "PAID" },
    });
    if (claimed.count === 0) return { found: true, credited: false };

    await tx.user.update({
      where: { id: purchase.userId },
      data: { coinBalance: { increment: purchase.coinsAdded } },
    });

    return { found: true, credited: true };
  });
}