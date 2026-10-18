// src/app/(loged)/app/calls/[id]/page.tsx
import { ProfileSkeleton, ReceiverProfileContent } from "@/components/site/loged/single-call/receiver-profile";
import { Suspense } from "react";



/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

/* -------------------------------------------------------------------------- */
/*  Page — static shell, no runtime data read here                             */
/* -------------------------------------------------------------------------- */
/**
 * Route: /app/calls/[id]
 *
 * `id` here is the RECEIVER'S Clerk user ID (not a Call ID).
 * The shell renders instantly; the profile data is streamed in via Suspense.
 *
 * Example URL: /app/calls/user_3KgvV2OtXWW7cvUFo4umeX1k0VD
 */
export default function ReceiverProfilePage({ params }: PageProps) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ReceiverProfileLoader params={params} />
    </Suspense>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loader — awaits params inside the Suspense boundary                        */
/* -------------------------------------------------------------------------- */

async function ReceiverProfileLoader({
  params,
}: {
  params: PageProps["params"];
}) {
  const { id } = await params;

  return <ReceiverProfileContent receiverClerkUserId={id} />;
}