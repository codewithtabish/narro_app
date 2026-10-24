// src/app/community/user/[clerkUserId]/page.tsx
import { getReceiverUserAction } from "@/app/actions/user/get-receiver-user-action";
import { ProfileView } from "@/components/site/pages/community/profile-view";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// 1. The Data Fetcher (Streamed inside Suspense)
async function ProfileContent({ clerkUserId }: { clerkUserId: string }) {
  const result = await getReceiverUserAction(clerkUserId);

  if (!result.success) {
    if (result.error === "USER_NOT_FOUND") {
      notFound();
    }

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Profile Unavailable</h1>
        <p className="mt-2 text-muted-foreground">{result.message}</p>
      </div>
    );
  }

  return <ProfileView user={result.user} />;
}

// 2. The Skeleton (Shows instantly while data loads)
function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse">
      <div className="w-full overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-sm">
        {/* Cover */}
        <div className="h-[240px] w-full bg-muted sm:h-[320px]" />
        {/* Avatar & Info */}
        <div className="relative flex flex-col items-center px-6 pb-8 text-center sm:px-10">
          <div className="-mt-16 mb-4 h-32 w-32 rounded-full border-[6px] border-card bg-muted sm:-mt-20 sm:h-40 sm:w-40" />
          <div className="mt-2 h-10 w-48 rounded-md bg-muted sm:h-12 sm:w-64" />
          <div className="mt-4 h-4 w-32 rounded-md bg-muted" />
        </div>
        {/* Grid */}
        <div className="mx-4 mb-4 grid grid-cols-1 gap-4 sm:mx-8 sm:grid-cols-2">
          <div className="h-32 rounded-2xl bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
        </div>
        {/* Actions */}
        <div className="border-t border-border/60 bg-muted/10 p-6 sm:p-8">
          <div className="flex gap-4">
            <div className="h-14 flex-1 rounded-2xl bg-muted" />
            <div className="h-14 flex-1 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. The Main Page (Renders instantly)
export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>;
}) {
  const { clerkUserId } = await params;

  return (
    <main className="pb-20 pt-8 sm:pt-12">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent clerkUserId={clerkUserId} />
      </Suspense>
    </main>
  );
}