import { currentUser } from "@clerk/nextjs/server";

/* -------------------------------------------------------------------------- */
/*  Time-of-day greeting                                                       */
/* -------------------------------------------------------------------------- */

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/* -------------------------------------------------------------------------- */
/*  App Greeting — "Ready to speak, {firstName}?"                              */
/* -------------------------------------------------------------------------- */

export async function AppGreeting() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";
  const greeting = getTimeOfDayGreeting();

  return (
    <section
      data-slot="app-greeting"
      aria-labelledby="app-greeting-heading"
      className="flex w-full flex-col items-start"
    >
      {/* Small uppercase time-of-day label */}
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
        {greeting}
      </span>

      {/* Big serif heading */}
      <h1
        id="app-greeting-heading"
        className="mt-2 font-serif text-[1.75rem] font-normal leading-[1.1] tracking-[-0.02em] text-balance text-foreground sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3rem]"
      >
        Ready to speak, {firstName}?
      </h1>

      {/* Subline */}
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Pick up where you left off or start something new.
      </p>
    </section>
  );
}