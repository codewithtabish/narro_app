import { Suspense } from "react";

import { AvailableNowStrip } from "@/components/site/loged/calls/available-now-strip";
import { CallsHeader } from "@/components/site/loged/calls/calls-header";
import { CallsHistoryEmpty } from "@/components/site/loged/calls/calls-history-empty";
import { CallsTabs } from "@/components/site/loged/calls/calls-tabs";
import { PartnersList } from "@/components/site/loged/calls/partners-list";

/* -------------------------------------------------------------------------- */
/*  Calls Page                                                                 */
/* -------------------------------------------------------------------------- */

interface CallsPageProps {
  searchParams: Promise<{ tab?: string; available?: string }>;
}

export default async function CallsPage({ searchParams }: CallsPageProps) {
  const params = await searchParams;

  const tab = params.tab === "history" ? "history" : "partners";
  const availableOnly = params.available === "1";

  return (
    <div className="flex w-full flex-col">
      <CallsHeader />

      <div className="mt-6 flex w-full flex-col gap-6 sm:mt-8 sm:gap-8">
        <CallsTabs
          activeTab={tab}
          availability={availableOnly ? "available" : "any"}
        />

        {tab === "partners" && (
          <>
            <Suspense fallback={null}>
              <AvailableNowStrip />
            </Suspense>

            <Suspense fallback={null}>
              <PartnersList availableOnly={availableOnly} />
            </Suspense>
          </>
        )}

        {tab === "history" && <CallsHistoryEmpty />}
      </div>
    </div>
  );
}