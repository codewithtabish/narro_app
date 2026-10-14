import { Suspense } from "react";

import { AvailableNowStrip } from "@/components/site/loged/calls/available-now-strip";
import { CallsFilters } from "@/components/site/loged/calls/calls-filters";
import { CallsHeader } from "@/components/site/loged/calls/calls-header";
import { CallsHistoryEmpty } from "@/components/site/loged/calls/calls-history-empty";
import { CallsTabs } from "@/components/site/loged/calls/calls-tabs";
import { PartnersList } from "@/components/site/loged/calls/partners-list";
import { ViewToggle } from "@/components/site/loged/calls/view-toggle";

/* -------------------------------------------------------------------------- */
/*  Calls Page                                                                 */
/* -------------------------------------------------------------------------- */

interface CallsPageProps {
  searchParams: Promise<{
    tab?: string;
    available?: string;
    lang?: string;
    level?: string;
    view?: string;
  }>;
}

export default async function CallsPage({ searchParams }: CallsPageProps) {
  const params = await searchParams;

  const tab = params.tab === "history" ? "history" : "partners";
  const availableOnly = params.available === "1";
  const language = params.lang ?? null;
  const level =
    params.level === "beginner" ||
    params.level === "intermediate" ||
    params.level === "advanced"
      ? params.level
      : "any";
  const view = params.view === "grid" ? "grid" : "list";

  return (
    <div className="flex w-full flex-col">
      <CallsHeader />

      <div className="mt-6 flex w-full flex-col gap-4 sm:mt-8 sm:gap-6">
        {/* Tabs + Filters + ViewToggle — row on desktop */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <CallsTabs activeTab={tab} />

          <div className="flex flex-wrap items-center gap-2">
            <CallsFilters
              activeTab={tab}
              language={language}
              availability={availableOnly ? "available" : "any"}
              level={level}
            />

            {tab === "partners" && (
              <div className="shrink-0">
                <ViewToggle />
              </div>
            )}
          </div>
        </div>

        {tab === "partners" && (
          <>
            <Suspense fallback={null}>
              <AvailableNowStrip />
            </Suspense>

            <Suspense fallback={null}>
              <PartnersList availableOnly={availableOnly} view={view} />
            </Suspense>
          </>
        )}

        {tab === "history" && <CallsHistoryEmpty />}
      </div>
    </div>
  );
}