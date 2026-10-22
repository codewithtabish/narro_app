import { auth } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import { PaymentStatusCard } from "@/components/site/pages/livestream/payment-status-card";
import prisma from "@/lib/clients/prisma-client";
import { fulfillCoinPurchase } from "@/lib/coins/fulfill";
import { isValidRedirectSignature } from "@/lib/safepay/safepay";

export const metadata = { title: "Payment" };

const select = {
  status: true,
  coinsAdded: true,
  safepayTrackerId: true,
} as const;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

type PageProps = {
  params: Promise<{ purchaseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** The page shell stays static. All request-time work happens inside Suspense. */
export default function PaymentResultPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentResult params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function PaymentLoading() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Checking your payment…</p>
    </main>
  );
}

async function PaymentResult({ params, searchParams }: PageProps) {
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