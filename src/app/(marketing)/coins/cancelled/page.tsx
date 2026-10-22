import { CloseTabButton } from "@/components/site/pages/livestream/close-tab-button";
import { X } from "lucide-react";
import Link from "next/link";


export const metadata = { title: "Payment cancelled" };

export default function PaymentCancelledPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div
        role="status"
        className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 text-center text-card-foreground shadow-xl"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <X className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold text-foreground">Payment cancelled</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You weren&apos;t charged. Go back to the stream whenever you&apos;re ready to buy coins.
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3">
          <CloseTabButton />
          <Link
            href="/live-stream"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Browse live streams
          </Link>
        </div>
      </div>
    </main>
  );
}