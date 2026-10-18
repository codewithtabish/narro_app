import { Suspense } from "react";

import { getCommunityUsers } from "@/app/actions/user/get-community-users";
import { CommunityDirectory } from "@/components/site/pages/community/community-directory";

export const metadata = {
  title: "Meet our community | NARRO",
  description: "Browse language learners from around the world.",
};

/* -------------------------------------------------------------------------- */
/*  Suspense Fallback (Skeleton)                                              */
/* -------------------------------------------------------------------------- */
function CommunityPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <div className="h-9 w-32 animate-pulse rounded-full bg-muted" />
        <div className="ml-auto h-10 w-20 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col animate-pulse overflow-hidden rounded-[24px] border border-border/60 bg-card p-2">
            <div className="aspect-4/3 w-full rounded-[18px] bg-muted" />
            <div className="p-4 flex flex-col gap-3">
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
              <div className="mt-4 h-10 w-full rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Fetcher (Server Component)                                           */
/* -------------------------------------------------------------------------- */
async function CommunityUsersFetcher() {
  const result = await getCommunityUsers(1, "available");

  if (!result.success) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Could not load community right now. Please try again later.
      </div>
    );
  }

  return (
    <CommunityDirectory 
      initialUsers={result.users} 
      initialHasMore={result.hasMore} 
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                       */
/* -------------------------------------------------------------------------- */
export default function CommunityPage() {
  return (
    // NO background, NO horizontal padding. 
    // I only added vertical padding (py-10) for breathing room.
    <main className="pb-20 pt-10 sm:pt-16">
      
      {/* Header */}
      <div className="mb-10 flex flex-col items-start gap-2">
        <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] text-foreground sm:text-[48px]">
          Meet our community.
        </h1>
        <p className="max-w-xl text-[16px] leading-relaxed text-muted-foreground">
          Connect with thousands of learners. Practice speaking, make friends, and build confidence together.
        </p>
      </div>

      {/* Directory with Suspense */}
      <Suspense fallback={<CommunityPageSkeleton />}>
        <CommunityUsersFetcher />
      </Suspense>

    </main>
  );
}