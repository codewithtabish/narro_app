import { notFound } from "next/navigation";

import { getReceiverUserAction } from "@/app/actions/user/get-receiver-user-action";
import { ProfileView } from "@/components/site/pages/community/profile-view";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>;
}) {
  const { clerkUserId } = await params;

  // Fetch the profile using the public action
  const result = await getReceiverUserAction(clerkUserId);

  // Handle errors gracefully
  if (!result.success) {
    // If the user genuinely doesn't exist in the database, show 404
    if (result.error === "USER_NOT_FOUND") {
      notFound(); 
    }

    // Show a clean error message for any other database issue
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Profile Unavailable</h1>
        <p className="mt-2 text-muted-foreground">{result.message}</p>
      </div>
    );
  }

  // Render the profile if successful
  return (
    <main className="pb-20 pt-8 sm:pt-12">
      <ProfileView user={result.user} />
    </main>
  );
}