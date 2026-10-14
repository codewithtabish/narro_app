import { cn } from "@/lib/utils";

export function CallsHistoryEmpty() {
  return (
    <section className="w-full">
      <div
        className={cn(
          "w-full rounded-3xl border border-dashed border-border",
          "bg-secondary/40 p-10 text-center",
        )}
      >
        <p className="text-base font-medium text-foreground">
          No call history yet
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Once you start making calls, they&apos;ll show up here.
        </p>
      </div>
    </section>
  );
}