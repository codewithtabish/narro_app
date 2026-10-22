"use client";

import { CloseTabButton } from "@/components/site/pages/livestream/close-tab-button";
import { Check, CircleAlert, Coins, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";


const POLL_MS = 2000;
const MAX_POLLS = 40; // about 80 seconds

export function PaymentStatus({ status, coins }: { status: string; coins: number }) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  // While the webhook is still on its way, re-run the server page every couple of seconds.
  useEffect(() => {
    if (status !== "PENDING") return;
    let polls = 0;
    const id = setInterval(() => {
      polls += 1;
      if (polls >= MAX_POLLS) {
        clearInterval(id);
        setTimedOut(true);
      } else {
        router.refresh();
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [status, router]);

  if (status === "PAID") {
    return (
      <Shell
        icon={<Check className="size-7" aria-hidden="true" />}
        tone="success"
        title="Payment received"
        body={
          <span className="inline-flex items-center gap-1.5">
            <Coins className="size-4 text-amber-500" aria-hidden="true" />
            {coins.toLocaleString()} coins were added to your balance.
          </span>
        }
      >
        <CloseTabButton />
        <HomeLink />
      </Shell>
    );
  }

  if (status === "PENDING") {
    return timedOut ? (
      <Shell
        icon={<CircleAlert className="size-7" aria-hidden="true" />}
        tone="warning"
        title="Still confirming your payment"
        body="This is taking longer than usual. If you paid, your coins are added automatically as soon as the payment is confirmed. You don't need to pay again."
      >
        <CloseTabButton />
        <HomeLink />
      </Shell>
    ) : (
      <Shell
        icon={<Loader2 className="size-7 animate-spin" aria-hidden="true" />}
        tone="neutral"
        title="Confirming your payment"
        body="This usually takes a few seconds. Keep this tab open."
      />
    );
  }

  if (status === "FAILED") {
    return (
      <Shell
        icon={<CircleAlert className="size-7" aria-hidden="true" />}
        tone="warning"
        title="This payment didn't go through"
        body="You weren't charged for this attempt. Go back to the stream and try again."
      >
        <CloseTabButton />
        <HomeLink />
      </Shell>
    );
  }

  return (
    <Shell
      icon={<CircleAlert className="size-7" aria-hidden="true" />}
      tone="warning"
      title="We couldn't find this payment"
      body="Make sure you're signed in to the same account you used to pay."
    >
      <HomeLink />
    </Shell>
  );
}

const TONES = {
  success: "bg-emerald-500/15 text-emerald-500",
  warning: "bg-amber-400/15 text-amber-500",
  neutral: "bg-muted text-muted-foreground",
} as const;

function Shell({
  icon,
  tone,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  tone: keyof typeof TONES;
  title: string;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div
        role="status"
        className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 text-center text-card-foreground shadow-xl"
      >
        <span className={`flex size-14 items-center justify-center rounded-full ${TONES[tone]}`}>
          {icon}
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
        {children && <div className="flex w-full flex-col items-center gap-3">{children}</div>}
      </div>
    </main>
  );
}

function HomeLink() {
  return (
    <Link
      href="/live-stream"
      className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      Browse live streams
    </Link>
  );
}