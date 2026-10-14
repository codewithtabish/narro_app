import { Suspense } from "react";

import { AppGreeting } from "./app-greeting";
import { AppHeroAIPractice } from "./app-hero-ai-practice";

/* -------------------------------------------------------------------------- */
/*  Loading skeleton                                                           */
/* -------------------------------------------------------------------------- */

function GreetingSkeleton() {
  return (
    <div className="flex w-full flex-col items-start">
      {/* Time-of-day label placeholder */}
      <div className="h-3 w-24 animate-pulse rounded bg-secondary/60" />
      {/* Heading placeholder */}
      <div className="mt-3 h-8 w-72 animate-pulse rounded bg-secondary/60 sm:h-10 sm:w-96" />
      {/* Subline placeholder */}
      <div className="mt-3 h-4 w-64 animate-pulse rounded bg-secondary/60" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

const APPMAINPAGE = () => {
  return (
    <div className="">
      <Suspense fallback={<GreetingSkeleton />}>
        <AppGreeting />
      </Suspense>
      <AppHeroAIPractice/>
    </div>
  );
};

export default APPMAINPAGE;