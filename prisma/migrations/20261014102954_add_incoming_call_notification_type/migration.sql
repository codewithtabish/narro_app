-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'INCOMING_CALL';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'ONLINE';
