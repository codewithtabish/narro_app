// src/lib/actions/user/get-current-user.ts
"use server";

import { auth, currentUser as getClerkUser } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/clients/prisma-client";

// ============================================================
// TYPES
// ============================================================

export type ProficiencyByLanguage = Record<string, string>;

export type CurrentUser = {
  id: string;
  clerkUserId: string;
  email: string | null;
  name: string;
  imageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  languagesSpoken: string[];
  languagesLearning: string[];
  proficiencyByLanguage: ProficiencyByLanguage;
  interests: string[];
  onboardingCompletedAt: Date | null;
  onboardingStep: "PROFILE" | "LANGUAGES" | "LEVEL" | "INTERESTS" | "COMPLETED";
  planTier: "FREE" | "PRO";
  paymentProvider: "NONE" | "SAFEPAY" | "REVENUECAT";
  planStartedAt: Date | null;
  planExpiresAt: Date | null;
  nextRenewalAt: Date | null;
  isPro: boolean;
  freeSecondsGranted: number;
  freeSecondsUsed: number;
  freeSecondsRemaining: number;
  proSecondsUsed: number;
  status: "ONLINE" | "OFFLINE";
  isAvailable: boolean;
  lastSeenAt: Date | null;
  counts: {
    aiSessions: number;
    callsMade: number;
    callsReceived: number;
    roomsHosted: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type GetCurrentUserResult =
  | { success: true; user: CurrentUser }
  | { success: false; error: string };

// ============================================================
// CACHED READ
// ============================================================

async function readCurrentUser(clerkUserId: string): Promise<CurrentUser | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.user(clerkUserId));
  cacheTag(CACHE_TAGS.onboarding(clerkUserId));

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      name: true,
      imageUrl: true,
      profileImageUrl: true,
      bio: true,
      languagesSpoken: true,
      languagesLearning: true,
      proficiencyByLanguage: true,
      interests: true,
      onboardingCompletedAt: true,
      onboarding: { select: { currentStep: true } },
      planTier: true,
      paymentProvider: true,
      planStartedAt: true,
      planExpiresAt: true,
      nextRenewalAt: true,
      freeSecondsGranted: true,
      freeSecondsUsed: true,
      status: true,
      isAvailable: true,
      lastSeenAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          aiSessions: true,
          callsAsCaller: true,
          callsAsReceiver: true,
          hostedRooms: true,
        },
      },
    },
  });

  if (!user) return null;

  const proSecondsAgg = await prisma.usageRecord.aggregate({
    where: { userId: user.id },
    _sum: { proSecondsUsed: true },
  });

  return mapToCurrentUser(user, proSecondsAgg._sum.proSecondsUsed ?? 0);
}

// ============================================================
// DIRECT READ
// ============================================================

async function readCurrentUserDirect(
  clerkUserId: string,
): Promise<CurrentUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        imageUrl: true,
        profileImageUrl: true,
        bio: true,
        languagesSpoken: true,
        languagesLearning: true,
        proficiencyByLanguage: true,
        interests: true,
        onboardingCompletedAt: true,
        onboarding: { select: { currentStep: true } },
        planTier: true,
        paymentProvider: true,
        planStartedAt: true,
        planExpiresAt: true,
        nextRenewalAt: true,
        freeSecondsGranted: true,
        freeSecondsUsed: true,
        status: true,
        isAvailable: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            aiSessions: true,
            callsAsCaller: true,
            callsAsReceiver: true,
            hostedRooms: true,
          },
        },
      },
    });

    if (!user) return null;

    const proSecondsAgg = await prisma.usageRecord.aggregate({
      where: { userId: user.id },
      _sum: { proSecondsUsed: true },
    });

    return mapToCurrentUser(user, proSecondsAgg._sum.proSecondsUsed ?? 0);
  } catch (err) {
    console.warn("[readCurrentUserDirect] DB error:", err);
    return null;
  }
}

// ============================================================
// ENSURE USER EXISTS — auto-create from Clerk if missing
// ============================================================

async function ensureUserExists(clerkUserId: string): Promise<CurrentUser | null> {
  const clerkUser = await getClerkUser();

  if (!clerkUser) {
    console.warn("[ensureUserExists] Clerk user not found:", clerkUserId);
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.username ||
    email?.split("@")[0] ||
    "there";
  const imageUrl = clerkUser.imageUrl ?? null;

  console.log("[ensureUserExists] Creating DB user for:", {
    clerkUserId,
    email,
    name,
  });

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        email,
        name,
        imageUrl,
        // Schema defaults:
        // isAvailable: true
        // status: ONLINE
        // languagesSpoken: []
        // languagesLearning: []
        // interests: []
        // onboardingCompletedAt: null
      },
      update: {
        email: email ?? undefined,
        name,
        imageUrl: imageUrl ?? undefined,
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        imageUrl: true,
        profileImageUrl: true,
        bio: true,
        languagesSpoken: true,
        languagesLearning: true,
        proficiencyByLanguage: true,
        interests: true,
        onboardingCompletedAt: true,
        onboarding: { select: { currentStep: true } },
        planTier: true,
        paymentProvider: true,
        planStartedAt: true,
        planExpiresAt: true,
        nextRenewalAt: true,
        freeSecondsGranted: true,
        freeSecondsUsed: true,
        status: true,
        isAvailable: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            aiSessions: true,
            callsAsCaller: true,
            callsAsReceiver: true,
            hostedRooms: true,
          },
        },
      },
    });

    console.log("[ensureUserExists] ✅ User created:", user.id);

    return mapToCurrentUser(user, 0);
  } catch (err) {
    console.error("[ensureUserExists] Failed to create user:", err);
    return null;
  }
}

// ============================================================
// MAPPER
// ============================================================

type RawUser = {
  id: string;
  clerkUserId: string;
  email: string | null;
  name: string;
  imageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  languagesSpoken: string[];
  languagesLearning: string[];
  proficiencyByLanguage: unknown;
  interests: string[];
  onboardingCompletedAt: Date | null;
  onboarding: { currentStep: string } | null;
  planTier: "FREE" | "PRO";
  paymentProvider: "NONE" | "SAFEPAY" | "REVENUECAT";
  planStartedAt: Date | null;
  planExpiresAt: Date | null;
  nextRenewalAt: Date | null;
  freeSecondsGranted: number;
  freeSecondsUsed: number;
  status: "ONLINE" | "OFFLINE";
  isAvailable: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    aiSessions: number;
    callsAsCaller: number;
    callsAsReceiver: number;
    hostedRooms: number;
  };
};

function mapToCurrentUser(user: RawUser, proSecondsUsed: number): CurrentUser {
  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
    profileImageUrl: user.profileImageUrl,
    bio: user.bio,
    languagesSpoken: user.languagesSpoken,
    languagesLearning: user.languagesLearning,
    proficiencyByLanguage:
      (user.proficiencyByLanguage as ProficiencyByLanguage) ?? {},
    interests: user.interests,
    onboardingCompletedAt: user.onboardingCompletedAt,
    onboardingStep: (user.onboarding?.currentStep ??
      "PROFILE") as CurrentUser["onboardingStep"],
    planTier: user.planTier,
    paymentProvider: user.paymentProvider,
    planStartedAt: user.planStartedAt,
    planExpiresAt: user.planExpiresAt,
    nextRenewalAt: user.nextRenewalAt,
    isPro: user.planTier === "PRO",
    freeSecondsGranted: user.freeSecondsGranted,
    freeSecondsUsed: user.freeSecondsUsed,
    freeSecondsRemaining: Math.max(
      0,
      user.freeSecondsGranted - user.freeSecondsUsed,
    ),
    proSecondsUsed,
    status: user.status,
    isAvailable: user.isAvailable,
    lastSeenAt: user.lastSeenAt,
    counts: {
      aiSessions: user._count.aiSessions,
      callsMade: user._count.callsAsCaller,
      callsReceived: user._count.callsAsReceiver,
      roomsHosted: user._count.hostedRooms,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ============================================================
// MAIN ACTION
// ============================================================

export async function getCurrentUserAction(): Promise<GetCurrentUserResult> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, error: "Not authenticated." };
    }

    // ── 1. Try cached read ────────────────────────────────
    try {
      const cached = await readCurrentUser(clerkUserId);
      if (cached) return { success: true, user: cached };
    } catch (err) {
      console.warn("[getCurrentUserAction] Cache read failed:", err);
    }

    // ── 2. Direct read ────────────────────────────────────
    const direct = await readCurrentUserDirect(clerkUserId);
    if (direct) return { success: true, user: direct };

    // ── 3. Auto-create from Clerk data ────────────────────
    console.log("[getCurrentUserAction] User missing in DB — auto-creating…");
    const created = await ensureUserExists(clerkUserId);

    if (created) return { success: true, user: created };

    // ── 4. Give up ────────────────────────────────────────
    return {
      success: false,
      error:
        "Could not load or create your account. Please sign out and try again.",
    };
  } catch (err) {
    console.error("[getCurrentUserAction] Error:", err);
    return { success: false, error: "Failed to load user data." };
  }
}