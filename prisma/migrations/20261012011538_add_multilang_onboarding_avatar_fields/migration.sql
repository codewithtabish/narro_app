-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('NONE', 'SAFEPAY', 'REVENUECAT');

-- CreateEnum
CREATE TYPE "SafepayStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SafepayPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('RINGING', 'ACCEPTED', 'REJECTED', 'MISSED', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'NATIVE');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('PROFILE', 'LANGUAGES', 'LEVEL', 'INTERESTS', 'COMPLETED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "languagesLearning" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "nextRenewalAt" TIMESTAMP(3),
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "planStartedAt" TIMESTAMP(3),
ADD COLUMN     "proficiencyByLanguage" JSONB,
ADD COLUMN     "profileImageUrl" TEXT;

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStep" "OnboardingStep" NOT NULL DEFAULT 'PROFILE',
    "completedSteps" "OnboardingStep"[] DEFAULT ARRAY[]::"OnboardingStep"[],
    "profileCompletedAt" TIMESTAMP(3),
    "languagesCompletedAt" TIMESTAMP(3),
    "levelCompletedAt" TIMESTAMP(3),
    "interestsCompletedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "abandonedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "source" TEXT,
    "variant" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafepaySubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "safepayCustomerId" TEXT,
    "safepaySubscriptionId" TEXT,
    "safepayTrackerId" TEXT,
    "safepayPlanId" TEXT,
    "planTier" "PlanTier" NOT NULL DEFAULT 'PRO',
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
    "status" "SafepayStatus" NOT NULL DEFAULT 'ACTIVE',
    "amount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentStart" TIMESTAMP(3),
    "currentEnd" TIMESTAMP(3),
    "nextRenewalAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafepaySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafepayPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "safepayTrackerId" TEXT,
    "transactionId" TEXT,
    "planTier" "PlanTier" NOT NULL DEFAULT 'PRO',
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "status" "SafepayPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "safepaySubscriptionId" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafepayPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "callerId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "liveKitRoomName" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'RINGING',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "endReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_userId_key" ON "Onboarding"("userId");

-- CreateIndex
CREATE INDEX "Onboarding_userId_idx" ON "Onboarding"("userId");

-- CreateIndex
CREATE INDEX "Onboarding_currentStep_idx" ON "Onboarding"("currentStep");

-- CreateIndex
CREATE INDEX "Onboarding_completedAt_idx" ON "Onboarding"("completedAt");

-- CreateIndex
CREATE INDEX "Onboarding_abandonedAt_idx" ON "Onboarding"("abandonedAt");

-- CreateIndex
CREATE INDEX "Onboarding_startedAt_idx" ON "Onboarding"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SafepaySubscription_safepaySubscriptionId_key" ON "SafepaySubscription"("safepaySubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SafepaySubscription_safepayTrackerId_key" ON "SafepaySubscription"("safepayTrackerId");

-- CreateIndex
CREATE INDEX "SafepaySubscription_userId_idx" ON "SafepaySubscription"("userId");

-- CreateIndex
CREATE INDEX "SafepaySubscription_userId_status_idx" ON "SafepaySubscription"("userId", "status");

-- CreateIndex
CREATE INDEX "SafepaySubscription_safepaySubscriptionId_idx" ON "SafepaySubscription"("safepaySubscriptionId");

-- CreateIndex
CREATE INDEX "SafepaySubscription_status_idx" ON "SafepaySubscription"("status");

-- CreateIndex
CREATE INDEX "SafepaySubscription_currentEnd_idx" ON "SafepaySubscription"("currentEnd");

-- CreateIndex
CREATE UNIQUE INDEX "SafepayPayment_referenceId_key" ON "SafepayPayment"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "SafepayPayment_safepayTrackerId_key" ON "SafepayPayment"("safepayTrackerId");

-- CreateIndex
CREATE UNIQUE INDEX "SafepayPayment_transactionId_key" ON "SafepayPayment"("transactionId");

-- CreateIndex
CREATE INDEX "SafepayPayment_userId_status_idx" ON "SafepayPayment"("userId", "status");

-- CreateIndex
CREATE INDEX "SafepayPayment_userId_createdAt_idx" ON "SafepayPayment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SafepayPayment_status_createdAt_idx" ON "SafepayPayment"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Call_liveKitRoomName_key" ON "Call"("liveKitRoomName");

-- CreateIndex
CREATE INDEX "Call_callerId_createdAt_idx" ON "Call"("callerId", "createdAt");

-- CreateIndex
CREATE INDEX "Call_receiverId_createdAt_idx" ON "Call"("receiverId", "createdAt");

-- CreateIndex
CREATE INDEX "Call_status_createdAt_idx" ON "Call"("status", "createdAt");

-- CreateIndex
CREATE INDEX "User_paymentProvider_idx" ON "User"("paymentProvider");

-- CreateIndex
CREATE INDEX "User_languagesSpoken_idx" ON "User"("languagesSpoken");

-- CreateIndex
CREATE INDEX "User_languagesLearning_idx" ON "User"("languagesLearning");

-- CreateIndex
CREATE INDEX "User_onboardingCompletedAt_idx" ON "User"("onboardingCompletedAt");

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafepaySubscription" ADD CONSTRAINT "SafepaySubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafepayPayment" ADD CONSTRAINT "SafepayPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafepayPayment" ADD CONSTRAINT "SafepayPayment_safepaySubscriptionId_fkey" FOREIGN KEY ("safepaySubscriptionId") REFERENCES "SafepaySubscription"("safepaySubscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
