// src/app/actions/user/get-community-users.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

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
  | { success: true; users: CommunityUser[]; hasMore: boolean; totalCount: number }
  | { success: false; error: string };

// Filter Types
export type CommunityFilter = 
  | "all" 
  | "online" 
  | "available" 
  | string; // Language code (e.g., "es", "fr")

const USERS_PER_PAGE = 24;

/* -------------------------------------------------------------------------- */
/*  Cached Read                                                                */
/* -------------------------------------------------------------------------- */

async function getCachedCommunityUsers(
  page: number,
  filter: CommunityFilter,
  currentClerkId?: string
): Promise<{ users: CommunityUser[]; totalCount: number }> {
  "use cache";
  
  cacheTag(CACHE_TAGS.communityDirectory);
  cacheLife("max");

  const skip = (page - 1) * USERS_PER_PAGE;

  // Build the query filter with strict Prisma typing
  const whereClause: Prisma.UserWhereInput = {
    onboardingCompletedAt: { not: null },
    // Exclude the current user if they are logged in
    ...(currentClerkId ? { clerkUserId: { not: currentClerkId } } : {}),
  };

  if (filter === "online") {
    whereClause.status = "ONLINE";
  } else if (filter === "available") {
    // If we want only people ready to call right now
    whereClause.isAvailable = true;
    whereClause.status = "ONLINE"; 
  } else if (filter !== "all") {
    // If filter is a language code (e.g., "en", "es")
    whereClause.OR = [
      { languagesSpoken: { has: filter } },
      { languagesLearning: { has: filter } },
    ];
  }

  // Fetch users and count in parallel
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
    users: users.map((u) => ({
      ...u,
      proficiencyByLanguage:
        (u.proficiencyByLanguage as Record<string, string>) ?? {},
    })),
    totalCount,
  };
}

/* -------------------------------------------------------------------------- */
/*  Server Action                                                              */
/* -------------------------------------------------------------------------- */

export async function getCommunityUsers(
  page: number = 1,
  filter: CommunityFilter = "all"
): Promise<GetCommunityUsersResult> {
  try {
    const safePage = Math.max(1, page);
    
    // 1. Check if the user is logged in
    const { userId: currentClerkId } = await auth();

    // 2. Fetch data from cache, passing the current ID to exclude them
    const { users, totalCount } = await getCachedCommunityUsers(
      safePage, 
      filter,
      currentClerkId ?? undefined
    );

    // Determine if there are more pages
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
    return { success: false, error: "Failed to load community." };
  }
}