-- CreateEnum
CREATE TYPE "ClientEventImportance" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');
CREATE TYPE "ClientEventDecisionType" AS ENUM ('ACCEPT', 'REJECT', 'LIMITED', 'DEFER');

-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'QUEST_STARTED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'ROLE_CHANGED';

-- AlterTable
ALTER TABLE "ClientEventOptionTemplate" ADD COLUMN "decisionType" "ClientEventDecisionType" NOT NULL DEFAULT 'ACCEPT';

ALTER TABLE "ProjectClientEvent" ADD COLUMN "importance" "ClientEventImportance" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "responseDeadline" TIMESTAMP(3),
ADD COLUMN "resultingXpChange" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ClientEventComment" (
    "id" TEXT NOT NULL,
    "projectClientEventId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientEventComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectHealthHistory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "previousValue" INTEGER NOT NULL,
    "newValue" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectHealthHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectClientEvent" ADD CONSTRAINT "ProjectClientEvent_clientEventTemplateId_fkey" FOREIGN KEY ("clientEventTemplateId") REFERENCES "ClientEventTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectClientEvent" ADD CONSTRAINT "ProjectClientEvent_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "ClientEventOptionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClientEventComment" ADD CONSTRAINT "ClientEventComment_projectClientEventId_fkey" FOREIGN KEY ("projectClientEventId") REFERENCES "ProjectClientEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientEventComment" ADD CONSTRAINT "ClientEventComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectHealthHistory" ADD CONSTRAINT "ProjectHealthHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectHealthHistory" ADD CONSTRAINT "ProjectHealthHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ProjectHealthHistory_projectId_createdAt_idx" ON "ProjectHealthHistory"("projectId", "createdAt");
