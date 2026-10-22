import { auth } from "@clerk/nextjs/server";

import { PaymentStatusCard } from "@/components/site/pages/livestream/payment-status-card";
import prisma from "@/lib/clients/prisma-client";
import { fulfillCoinPurchase } from "@/lib/coins/fulfill";
import { isValidRedirectSignature } from "@/lib/safepay/safepay";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment" };

const select = {
  status: true,
  coinsAdded: true,
  safepayTrackerId: true,
} as const;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function PaymentResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ purchaseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { purchaseId } = await params;
  const query = await searchParams;
  const { userId } = await auth();

  // Only the buyer can see their own purchase.
  const find = () =>
    userId
      ? prisma.coinPurchase.findFirst({
          where: { id: purchaseId, user: { clerkUserId: userId } },
          select,
        })
      : null;

  let purchase = await find();

  // Fallback: if the webhook hasn't landed yet but Safepay's signed redirect is valid,
  // credit now. fulfillCoinPurchase is idempotent, so the webhook can't double-credit.
  if (purchase && purchase.status !== "PAID" && purchase.safepayTrackerId) {
    const tracker = first(query.tracker);
    const sig = first(query.sig);
    if (
      tracker &&
      sig &&
      tracker === purchase.safepayTrackerId &&
      isValidRedirectSignature(tracker, sig)
    ) {
      await fulfillCoinPurchase(tracker);
      purchase = await find();
    }
  }

  return (
    <PaymentStatusCard
      status={purchase?.status ?? "NOT_FOUND"}
      coins={purchase?.coinsAdded ?? 0}
    />
  );
}