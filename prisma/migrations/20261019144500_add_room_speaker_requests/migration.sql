-- CreateTable
CREATE TABLE "RoomSpeakerRequest" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomSpeakerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomSpeakerRequest_roomId_status_idx" ON "RoomSpeakerRequest"("roomId", "status");

-- CreateIndex
CREATE INDEX "RoomSpeakerRequest_userId_idx" ON "RoomSpeakerRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomSpeakerRequest_roomId_userId_key" ON "RoomSpeakerRequest"("roomId", "userId");

-- AddForeignKey
ALTER TABLE "RoomSpeakerRequest" ADD CONSTRAINT "RoomSpeakerRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomSpeakerRequest" ADD CONSTRAINT "RoomSpeakerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
