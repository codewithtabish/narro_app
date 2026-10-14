-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "AISessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'INCOMPLETE', 'TRIALING', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "RoomVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_MESSAGE', 'ROOM_INVITATION', 'PROGRESS_REPORT', 'SUBSCRIPTION_UPDATE', 'MISSED_CALL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PushPlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "PushProvider" AS ENUM ('FCM', 'EXPO', 'APNS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "bio" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "learningLanguage" TEXT NOT NULL DEFAULT 'en',
    "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE',
    "lastSeenAt" TIMESTAMP(3),
    "freeSecondsGranted" INTEGER NOT NULL DEFAULT 600,
    "freeSecondsUsed" INTEGER NOT NULL DEFAULT 0,
    "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "liveKitRoomName" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "visibility" "RoomVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "RoomStatus" NOT NULL DEFAULT 'OPEN',
    "maxParticipants" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "languageName" TEXT NOT NULL,
    "status" "AISessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalDurationSeconds" INTEGER NOT NULL DEFAULT 0,
    "freeSecondsUsed" INTEGER NOT NULL DEFAULT 0,
    "proSecondsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AISession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "revenueCatAppUserId" TEXT,
    "productId" TEXT,
    "entitlementId" TEXT,
    "store" TEXT,
    "originalTransactionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiSessionId" TEXT,
    "secondsUsed" INTEGER NOT NULL,
    "freeSecondsUsed" INTEGER NOT NULL DEFAULT 0,
    "proSecondsUsed" INTEGER NOT NULL DEFAULT 0,
    "modelKey" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiSessionId" TEXT,
    "languageCode" TEXT NOT NULL,
    "languageName" TEXT NOT NULL,
    "overallScore" INTEGER,
    "fluencyScore" INTEGER,
    "vocabularyScore" INTEGER,
    "grammarScore" INTEGER,
    "pronunciationScore" INTEGER,
    "estimatedLevel" TEXT,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "areasToImprove" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exampleCorrections" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "userOneId" TEXT NOT NULL,
    "userTwoId" TEXT NOT NULL,
    "firebaseChatId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT,
    "chatConversationId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushToken" TEXT NOT NULL,
    "platform" "PushPlatform" NOT NULL,
    "provider" "PushProvider" NOT NULL,
    "deviceId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRegisteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL,
    "blockedById" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");

-- CreateIndex
CREATE INDEX "User_planTier_idx" ON "User"("planTier");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Room_liveKitRoomName_key" ON "Room"("liveKitRoomName");

-- CreateIndex
CREATE INDEX "Room_hostId_idx" ON "Room"("hostId");

-- CreateIndex
CREATE INDEX "Room_status_visibility_idx" ON "Room"("status", "visibility");

-- CreateIndex
CREATE INDEX "Room_language_status_idx" ON "Room"("language", "status");

-- CreateIndex
CREATE INDEX "Room_createdAt_idx" ON "Room"("createdAt");

-- CreateIndex
CREATE INDEX "AISession_userId_createdAt_idx" ON "AISession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AISession_userId_status_idx" ON "AISession"("userId", "status");

-- CreateIndex
CREATE INDEX "AISession_status_startedAt_idx" ON "AISession"("status", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_originalTransactionId_key" ON "Subscription"("originalTransactionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "Subscription_userId_tier_idx" ON "Subscription"("userId", "tier");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Subscription_revenueCatAppUserId_idx" ON "Subscription"("revenueCatAppUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_idempotencyKey_key" ON "UsageRecord"("idempotencyKey");

-- CreateIndex
CREATE INDEX "UsageRecord_userId_createdAt_idx" ON "UsageRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UsageRecord_aiSessionId_idx" ON "UsageRecord"("aiSessionId");

-- CreateIndex
CREATE INDEX "ProgressReport_userId_createdAt_idx" ON "ProgressReport"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProgressReport_aiSessionId_idx" ON "ProgressReport"("aiSessionId");

-- CreateIndex
CREATE INDEX "ProgressReport_userId_languageCode_idx" ON "ProgressReport"("userId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_firebaseChatId_key" ON "ChatConversation"("firebaseChatId");

-- CreateIndex
CREATE INDEX "ChatConversation_userOneId_lastMessageAt_idx" ON "ChatConversation"("userOneId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatConversation_userTwoId_lastMessageAt_idx" ON "ChatConversation"("userTwoId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_userOneId_userTwoId_key" ON "ChatConversation"("userOneId", "userTwoId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_roomId_idx" ON "Notification"("roomId");

-- CreateIndex
CREATE INDEX "Notification_chatConversationId_idx" ON "Notification"("chatConversationId");

-- CreateIndex
CREATE UNIQUE INDEX "PushDevice_pushToken_key" ON "PushDevice"("pushToken");

-- CreateIndex
CREATE INDEX "PushDevice_userId_enabled_idx" ON "PushDevice"("userId", "enabled");

-- CreateIndex
CREATE INDEX "PushDevice_lastRegisteredAt_idx" ON "PushDevice"("lastRegisteredAt");

-- CreateIndex
CREATE INDEX "UserBlock_blockedById_idx" ON "UserBlock"("blockedById");

-- CreateIndex
CREATE INDEX "UserBlock_blockedUserId_idx" ON "UserBlock"("blockedUserId");

-- CreateIndex
CREATE INDEX "UserBlock_createdAt_idx" ON "UserBlock"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockedById_blockedUserId_key" ON "UserBlock"("blockedById", "blockedUserId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISession" ADD CONSTRAINT "AISession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_aiSessionId_fkey" FOREIGN KEY ("aiSessionId") REFERENCES "AISession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_aiSessionId_fkey" FOREIGN KEY ("aiSessionId") REFERENCES "AISession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_userTwoId_fkey" FOREIGN KEY ("userTwoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chatConversationId_fkey" FOREIGN KEY ("chatConversationId") REFERENCES "ChatConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushDevice" ADD CONSTRAINT "PushDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
