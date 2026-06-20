-- CreateEnum
CREATE TYPE "SetupStep" AS ENUM ('MODE', 'TEAM', 'ROLES', 'ROLE_APPROVAL', 'STACK', 'SUMMARY', 'COMPLETED');

-- AlterTable
ALTER TABLE "CampaignTemplate" ADD COLUMN     "projectGoal" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "prerequisites" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "skillKeys" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "techStack" JSONB,
ADD COLUMN     "stackAssessment" JSONB,
ADD COLUMN     "setupStep" "SetupStep" NOT NULL DEFAULT 'MODE';
