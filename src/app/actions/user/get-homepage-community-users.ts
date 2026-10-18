
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

export type HomepageUser = {
  id: string;
  name: string;
  imageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  languagesSpoken: string[];
  languagesLearning: string[];
  proficiencyByLanguage: Record<string, string>;
  interests: string[];
};

export type GetHomepageCommunityUsersResult =
  | { success: true; users: HomepageUser[] }
  | { success: false; error: string };

async function getCachedCommunityUsers(
  currentClerkId?: string,
): Promise<HomepageUser[]> {
  "use cache";

  cacheTag(CACHE_TAGS.homepageCommunity);
  cacheLife("max");

  const users = await prisma.user.findMany({
    where: {
      onboardingCompletedAt: { not: null },
      ...(currentClerkId
        ? { clerkUserId: { not: currentClerkId } }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      profileImageUrl: true,
      bio: true,
      languagesSpoken: true,
      languagesLearning: true,
      proficiencyByLanguage: true,
      interests: true,
    },
  });

  return users.map((user) => ({
    ...user,
    proficiencyByLanguage:
      (user.proficiencyByLanguage as Record<string, string> | null) ?? {},
  }));
}

export async function getHomepageCommunityUsers(): Promise<GetHomepageCommunityUsersResult> {
  await connection();

  try {
    const { userId: currentClerkId } = await auth();

    const users = await getCachedCommunityUsers(
      currentClerkId ?? undefined,
    );

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error("[getHomepageCommunityUsers] Error:", error);

    return {
      success: false,
      error: "Failed to load community users.",
    };
  }
}
