"use client";

import { CheckCircle2, Clock, Coins, SearchX, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface PaymentStatusCardProps {
  /** CoinPurchase.status ("PENDING" | "PAID" | "FAILED"), or "NOT_FOUND". */
  status: string;
  coins: number;
}

const POLL_MS = 3000;
const MAX_POLLS = 10;

export function PaymentStatusCard({ status, coins }: PaymentStatusCardProps) {
  const router = useRouter();
  const polls = useRef(0);

  // While pending, re-run the server page so it picks up the webhook result.
  useEffect(() => {
    if (status !== "PENDING") return;

    const id = setInterval(() => {
      polls.current += 1;
      if (polls.current > MAX_POLLS) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, POLL_MS);

    return () => clearInterval(id);
  }, [status, router]);

  const view = getView(status, coins);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <view.Icon className={`size-14 ${view.iconClass}`} aria-hidden="true" />

      <h1 className="text-xl font-semibold text-foreground">{view.title}</h1>
      <p className="text-sm text-muted-foreground">{view.message}</p>

      {status === "PAID" && coins > 0 && (
        <div className="flex items-center gap-1.5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-base font-semibold text-amber-600 dark:text-amber-300">
          <Coins className="size-5" aria-hidden="true" />
          {coins.toLocaleString()} coins added
        </div>
      )}

      {/* TODO: change "/" to wherever users should land after paying */}
      <Link
        href="/"
        className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-linear-to-r from-[#6B4A3A] to-[#8a5f4a] px-4 text-sm font-semibold text-white shadow-lg shadow-[#6B4A3A]/30 transition-all hover:brightness-110 active:scale-[0.98]"
      >
        {status === "PAID" ? "Continue" : "Back to app"}
      </Link>
    </main>
  );
}

function getView(status: string, coins: number) {
  switch (status) {
    case "PAID":
      return {
        Icon: CheckCircle2,
        iconClass: "text-emerald-500",
        title: "Payment successful",
        message:
          coins > 0
            ? "Your coins are in your balance and ready to use."
            : "Your coins are in your balance.",
      };
    case "PENDING":
      return {
        Icon: Clock,
        iconClass: "text-amber-500 animate-pulse",
        title: "Confirming your payment",
        message:
          "This usually takes a few seconds. You can leave this page, your coins will appear as soon as the payment is confirmed.",
      };
    case "FAILED":
      return {
        Icon: XCircle,
        iconClass: "text-destructive",
        title: "Payment failed",
        message: "You were not charged. Please try again.",
      };
    default:
      return {
        Icon: SearchX,
        iconClass: "text-muted-foreground",
        title: "Payment not found",
        message:
          "We couldn't find this payment on your account. If you were charged, contact support.",
      };
  }
}