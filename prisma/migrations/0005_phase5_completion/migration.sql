-- AlterTable
ALTER TABLE "Project" ADD COLUMN "solutionDescription" TEXT,
ADD COLUMN "screenshots" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "FinalReport" ADD COLUMN "reportPayload" JSONB;

ALTER TABLE "UserFinalReport" ADD COLUMN "skillXpBreakdown" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "roleContribution" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "suggestedNextDirection" TEXT NOT NULL DEFAULT '';
