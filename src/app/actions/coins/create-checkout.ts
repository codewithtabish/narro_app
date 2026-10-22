"use server";

import {
  CURRENCY,
  MAX_USD,
  MIN_USD,
  coinsForUsd,
  formatUsd,
} from "@/data/coins";
import prisma from "@/lib/clients/prisma-client";
import { getSafepay } from "@/lib/safepay/safepay";
import { auth } from "@clerk/nextjs/server";

type Result = { success: true; url: string } | { success: false; error: string };

const MAX_PENDING_PER_HOUR = 10;

/** What we store in the database: 1 USD = 100 cents (matches the schema comment). */
const CENTS_PER_USD = 100;

/**
 * What we send to Safepay. Safepay takes whole dollars: with 100 here, the
 * $2 pack showed up in the Safepay dashboard as "USD. 200.00". So this is 1.
 */
const SAFEPAY_AMOUNT_MULTIPLIER = 1;

export async function createCoinCheckout(input: { amountUsd: number }): Promise<Result> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Sign in to buy coins." };

  const amount = Number(input?.amountUsd);
  if (!Number.isInteger(amount) || amount < MIN_USD || amount > MAX_USD) {
    return {
      success: false,
      error: `Enter an amount between ${formatUsd(MIN_USD)} and ${formatUsd(MAX_USD)}.`,
    };
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });
  if (!user) return { success: false, error: "We couldn't find your account." };

  // Stop someone from spamming checkout sessions.
  const recentPending = await prisma.coinPurchase.count({
    where: {
      userId: user.id,
      status: "PENDING",
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentPending >= MAX_PENDING_PER_HOUR) {
    return { success: false, error: "Too many unfinished payments. Try again in a little while." };
  }

  // The server decides the coins. The client only suggests a dollar amount.
  const purchase = await prisma.coinPurchase.create({
    data: {
      userId: user.id,
      coinsAdded: coinsForUsd(amount),
      amountPaid: amount * CENTS_PER_USD, // cents
      currency: CURRENCY, // "USD"
    },
    select: { id: true },
  });

  try {
    const safepay = getSafepay();

    const { token } = await safepay.payments.create({
      amount: amount * SAFEPAY_AMOUNT_MULTIPLIER,
      currency: CURRENCY,
    });

    await prisma.coinPurchase.update({
      where: { id: purchase.id },
      data: { safepayTrackerId: token },
    });

    const app = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

    const url = await safepay.checkout.create({
      token,
      orderId: purchase.id,
      cancelUrl: `${app}/coins/cancelled`,
      redirectUrl: `${app}/coins/success/${purchase.id}`,
      source: "custom",
      webhooks: true,
    });

    return { success: true, url };
  } catch (error) {
    console.error("[create-coin-checkout] failed", error);
    await prisma.coinPurchase
      .update({ where: { id: purchase.id }, data: { status: "FAILED" } })
      .catch(() => {});
    return { success: false, error: "We couldn't start the payment. Please try again." };
  }
}