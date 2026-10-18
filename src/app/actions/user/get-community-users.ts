
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

export type CommunityUser = {
  id: string;
  clerkUserId: string;
  name: string;
  imageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  languagesSpoken: string[];
  languagesLearning: string[];
  proficiencyByLanguage: Record<string, string>;
  interests: string[];
  status: "ONLINE" | "OFFLINE";
  isAvailable: boolean;
};

export type GetCommunityUsersResult =
  | {
      success: true;
      users: CommunityUser[];
      hasMore: boolean;
      totalCount: number;
    }
  | { success: false; error: string };

export type CommunityFilter = "all" | "online" | "available" | string;

const USERS_PER_PAGE = 24;

async function getCachedCommunityUsers(
  page: number,
  filter: CommunityFilter,
  currentClerkId?: string,
): Promise<{ users: CommunityUser[]; totalCount: number }> {
  "use cache";

  cacheTag(CACHE_TAGS.communityDirectory);
  cacheLife("max");

  const skip = (page - 1) * USERS_PER_PAGE;

  const whereClause: Prisma.UserWhereInput = {
    onboardingCompletedAt: { not: null },
    ...(currentClerkId
      ? { clerkUserId: { not: currentClerkId } }
      : {}),
  };

  if (filter === "online") {
    whereClause.status = "ONLINE";
  } else if (filter === "available") {
    whereClause.isAvailable = true;
    whereClause.status = "ONLINE";
  } else if (filter !== "all") {
    whereClause.OR = [
      { languagesSpoken: { has: filter } },
      { languagesLearning: { has: filter } },
    ];
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: USERS_PER_PAGE,
      select: {
        id: true,
        clerkUserId: true,
        name: true,
        imageUrl: true,
        profileImageUrl: true,
        bio: true,
        languagesSpoken: true,
        languagesLearning: true,
        proficiencyByLanguage: true,
        interests: true,
        status: true,
        isAvailable: true,
      },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return {
    users: users.map((user) => ({
      ...user,
      proficiencyByLanguage:
        (user.proficiencyByLanguage as Record<string, string> | null) ??
        {},
    })),
    totalCount,
  };
}

export async function getCommunityUsers(
  page: number = 1,
  filter: CommunityFilter = "all",
): Promise<GetCommunityUsersResult> {
  await connection();

  try {
    const { userId: currentClerkId } = await auth();

    const safePage = Number.isFinite(page)
      ? Math.max(1, Math.floor(page))
      : 1;

    const { users, totalCount } = await getCachedCommunityUsers(
      safePage,
      filter,
      currentClerkId ?? undefined,
    );

    const skip = (safePage - 1) * USERS_PER_PAGE;
    const hasMore = skip + users.length < totalCount;

    return {
      success: true,
      users,
      hasMore,
      totalCount,
    };
  } catch (error) {
    console.error("[getCommunityUsers] Error:", error);

    return {
      success: false,
      error: "Failed to load community.",
    };
  }
}
