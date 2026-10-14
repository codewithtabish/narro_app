// src/lib/actions/partners/get-users-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";
import {
    type GetUsersOptions,
    type GetUsersResult,
    type PartnerUser,
    USERS_MAX_PAGE_SIZE,
    USERS_PAGE_SIZE,
} from "@/types/types";

/* -------------------------------------------------------------------------- */
/*  Get Users                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * Returns users from the DB (excluding the current user).
 *
 * - `available: true`  → only users with `isAvailable: true`
 *                        (for the "Available Now" strip)
 * - `available: false` → all onboarded users (default)
 *
 * No language matching. No onboarding-preference filtering.
 * Cached with `"use cache"`.
 */
export async function getUsers(
  options: GetUsersOptions = {},
): Promise<GetUsersResult> {
  const empty: GetUsersResult = {
    users: [],
    total: 0,
    page: 1,
    limit: USERS_PAGE_SIZE,
    totalPages: 0,
    hasMore: false,
  };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return empty;

  const page = Math.max(1, Math.floor(options.page ?? 1));
  const limit = Math.max(
    1,
    Math.min(USERS_MAX_PAGE_SIZE, Math.floor(options.limit ?? USERS_PAGE_SIZE)),
  );
  const available = options.available ?? false;

  return fetchUsers(clerkUserId, page, limit, available);
}

/* -------------------------------------------------------------------------- */
/*  Cached fetch                                                               */
/* -------------------------------------------------------------------------- */

async function fetchUsers(
  clerkUserId: string,
  page: number,
  limit: number,
  available: boolean,
): Promise<GetUsersResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.users);

  // Exclude current user
  const me = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  if (!me) {
    return {
      users: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      hasMore: false,
    };
  }

  // Where clause
  const where = {
    NOT: { id: me.id },
    onboardingCompletedAt: { not: null },
    ...(available ? { isAvailable: true } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [
        { isAvailable: "desc" }, // Available users first
        { lastSeenAt: "desc" },  // Then most recently seen
        { createdAt: "desc" },   // Then newest
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        profileImageUrl: true,
        bio: true,
        isAvailable: true,
        languagesSpoken: true,
        languagesLearning: true,
        proficiencyByLanguage: true,
        interests: true,
        lastSeenAt: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users: users.map(
      (p): PartnerUser => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        profileImageUrl: p.profileImageUrl,
        bio: p.bio,
        isAvailable: p.isAvailable,
        languagesSpoken: p.languagesSpoken,
        languagesLearning: p.languagesLearning,
        proficiencyByLanguage:
          (p.proficiencyByLanguage as Record<string, string>) ?? {},
        interests: p.interests,
        lastSeenAt: p.lastSeenAt,
      }),
    ),
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}