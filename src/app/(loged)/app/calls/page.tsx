import { Suspense } from "react";

import { CallsHeader } from "@/components/site/loged/calls/calls-header";
import { CallsTabs } from "@/components/site/loged/calls/calls-tabs";
import { OnlineNowSkeleton } from "@/components/site/loged/calls/online-now-skeleton";
import { OnlineNowStrip } from "@/components/site/loged/calls/online-now-strip";
import { PartnersList } from "@/components/site/loged/calls/partners-list";
import { PartnersSkeleton } from "@/components/site/loged/calls/partners-skeleton";

/* -------------------------------------------------------------------------- */
/*  Calls Page                                                                 */
/* -------------------------------------------------------------------------- */

export default function CallsPage() {
  return (
    <div className="flex w-full flex-col gap-10 pb-10 lg:gap-14">
      {/* Static — header + tabs */}
      <div className="flex flex-col gap-6">
        <CallsHeader />
        <CallsTabs />
      </div>

      {/* Online Now — streamed */}
      <Suspense fallback={<OnlineNowSkeleton />}>
        <OnlineNowStrip />
      </Suspense>

      {/* All Partners — streamed */}
      <Suspense fallback={<PartnersSkeleton />}>
        <PartnersList />
      </Suspense>
    </div>
  );
}