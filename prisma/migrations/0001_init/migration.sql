-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'pl');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ProjectMode" AS ENUM ('SOLO', 'TEAM');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('SETUP', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProjectQuestStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'REVIEW', 'CHANGES_REQUIRED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('MAIN', 'SIDE');

-- CreateEnum
CREATE TYPE "QuestCategory" AS ENUM ('PLANNING', 'SETUP', 'FRONTEND', 'BACKEND', 'DATABASE', 'TESTING', 'DEVOPS', 'UX_UI', 'GIT', 'DOCUMENTATION', 'TEAMWORK', 'PRODUCT');

-- CreateEnum
CREATE TYPE "ClientEventTriggerType" AS ENUM ('CHAPTER_START', 'QUEST_COMPLETED', 'TIME_SINCE_START', 'MANUAL');

-- CreateEnum
CREATE TYPE "ClientEventStatus" AS ENUM ('PENDING', 'RESOLVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuestSubmissionStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'CHANGES_REQUIRED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('QUEST_UNLOCKED', 'QUEST_ASSIGNED', 'QUEST_SUBMITTED', 'QUEST_REVIEWED', 'CLIENT_EVENT_TRIGGERED', 'CLIENT_EVENT_RESOLVED', 'XP_AWARDED', 'HEALTH_CHANGED', 'ACHIEVEMENT_UNLOCKED', 'PROJECT_COMPLETED');

-- CreateEnum
CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "preferredDirection" TEXT,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "locale" "Locale" NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("userId","skillId")
);

-- CreateTable
CREATE TABLE "CampaignTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessProblem" TEXT NOT NULL,
    "difficulty" "CampaignDifficulty" NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "minimumTeamSize" INTEGER NOT NULL,
    "maximumTeamSize" INTEGER NOT NULL,
    "supportsSolo" BOOLEAN NOT NULL DEFAULT true,
    "status" "CampaignStatus" NOT NULL DEFAULT 'PUBLISHED',
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignChapterTemplate" (
    "id" TEXT NOT NULL,
    "campaignTemplateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CampaignChapterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestTemplate" (
    "id" TEXT NOT NULL,
    "chapterTemplateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "questType" "QuestType" NOT NULL,
    "category" "QuestCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "businessDescription" TEXT NOT NULL,
    "technicalGoal" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "baseXp" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isMainQuest" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "unlockRule" TEXT NOT NULL,
    "acceptanceCriteria" JSONB NOT NULL,
    "learningResources" JSONB NOT NULL,

    CONSTRAINT "QuestTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestDependencyTemplate" (
    "questTemplateId" TEXT NOT NULL,
    "dependsOnQuestTemplateId" TEXT NOT NULL,

    CONSTRAINT "QuestDependencyTemplate_pkey" PRIMARY KEY ("questTemplateId","dependsOnQuestTemplateId")
);

-- CreateTable
CREATE TABLE "QuestSkillRewardTemplate" (
    "questTemplateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,

    CONSTRAINT "QuestSkillRewardTemplate_pkey" PRIMARY KEY ("questTemplateId","skillId")
);

-- CreateTable
CREATE TABLE "ClientEventTemplate" (
    "id" TEXT NOT NULL,
    "campaignTemplateId" TEXT NOT NULL,
    "chapterTemplateId" TEXT,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "triggerType" "ClientEventTriggerType" NOT NULL,
    "triggerConfiguration" JSONB NOT NULL,
    "responseDeadlineHours" INTEGER,
    "affectedQuestTemplateIds" JSONB NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ClientEventTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientEventOptionTemplate" (
    "id" TEXT NOT NULL,
    "clientEventTemplateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "healthImpact" INTEGER NOT NULL,
    "xpImpact" INTEGER NOT NULL,
    "resultMessage" TEXT NOT NULL,
    "followUpConfiguration" JSONB NOT NULL,

    CONSTRAINT "ClientEventOptionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "campaignTemplateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mode" "ProjectMode" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'SETUP',
    "leaderId" TEXT NOT NULL,
    "currentChapterId" TEXT,
    "projectHealth" INTEGER NOT NULL DEFAULT 85,
    "teamLevel" INTEGER NOT NULL DEFAULT 1,
    "estimatedEndDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publicSlug" TEXT,
    "repositoryUrl" TEXT,
    "liveDemoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL DEFAULT 'MEMBER',
    "preferredRoles" JSONB NOT NULL,
    "approvedRoles" JSONB NOT NULL,
    "contributionScore" INTEGER NOT NULL DEFAULT 0,
    "teamworkXp" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "ProjectQuest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "questTemplateId" TEXT NOT NULL,
    "status" "ProjectQuestStatus" NOT NULL DEFAULT 'LOCKED',
    "unlockedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "suggestedDeadline" TIMESTAMP(3),
    "healthImpact" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestAssignment" (
    "projectQuestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestAssignment_pkey" PRIMARY KEY ("projectQuestId","userId")
);

-- CreateTable
CREATE TABLE "QuestSubmission" (
    "id" TEXT NOT NULL,
    "projectQuestId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "commitUrl" TEXT NOT NULL,
    "pullRequestUrl" TEXT,
    "description" TEXT NOT NULL,
    "githubMetadata" JSONB,
    "status" "QuestSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedById" TEXT,
    "reviewComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "QuestSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestComment" (
    "id" TEXT NOT NULL,
    "projectQuestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectClientEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientEventTemplateId" TEXT NOT NULL,
    "status" "ClientEventStatus" NOT NULL DEFAULT 'PENDING',
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "selectedOptionId" TEXT,
    "leaderResponse" TEXT,
    "resultingHealthChange" INTEGER NOT NULL DEFAULT 0,
    "resultMessage" TEXT,

    CONSTRAINT "ProjectClientEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectActivity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" "AchievementRarity" NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","achievementId","projectId")
);

-- CreateTable
CREATE TABLE "FinalReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "finalGrade" TEXT NOT NULL,
    "finalHealth" INTEGER NOT NULL,
    "completionScore" INTEGER NOT NULL,
    "teamworkScore" INTEGER NOT NULL,
    "testingScore" INTEGER NOT NULL,
    "documentationScore" INTEGER NOT NULL,
    "adaptabilityScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFinalReport" (
    "id" TEXT NOT NULL,
    "finalReportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questsCompleted" INTEGER NOT NULL,
    "commitsSubmitted" INTEGER NOT NULL,
    "reviewsCompleted" INTEGER NOT NULL,
    "contributionSummary" TEXT NOT NULL,
    "strongestSkills" JSONB NOT NULL,
    "improvementAreas" JSONB NOT NULL,
    "finalScore" INTEGER NOT NULL,

    CONSTRAINT "UserFinalReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_key_key" ON "Skill"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTemplate_slug_key" ON "CampaignTemplate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "QuestTemplate_chapterTemplateId_slug_key" ON "QuestTemplate"("chapterTemplateId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_publicSlug_key" ON "Project"("publicSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectQuest_projectId_questTemplateId_key" ON "ProjectQuest"("projectId", "questTemplateId");

-- CreateIndex
CREATE INDEX "ProjectActivity_projectId_createdAt_idx" ON "ProjectActivity"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_key_key" ON "Achievement"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FinalReport_projectId_key" ON "FinalReport"("projectId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignChapterTemplate" ADD CONSTRAINT "CampaignChapterTemplate_campaignTemplateId_fkey" FOREIGN KEY ("campaignTemplateId") REFERENCES "CampaignTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestTemplate" ADD CONSTRAINT "QuestTemplate_chapterTemplateId_fkey" FOREIGN KEY ("chapterTemplateId") REFERENCES "CampaignChapterTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestDependencyTemplate" ADD CONSTRAINT "QuestDependencyTemplate_questTemplateId_fkey" FOREIGN KEY ("questTemplateId") REFERENCES "QuestTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestDependencyTemplate" ADD CONSTRAINT "QuestDependencyTemplate_dependsOnQuestTemplateId_fkey" FOREIGN KEY ("dependsOnQuestTemplateId") REFERENCES "QuestTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestSkillRewardTemplate" ADD CONSTRAINT "QuestSkillRewardTemplate_questTemplateId_fkey" FOREIGN KEY ("questTemplateId") REFERENCES "QuestTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestSkillRewardTemplate" ADD CONSTRAINT "QuestSkillRewardTemplate_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientEventTemplate" ADD CONSTRAINT "ClientEventTemplate_campaignTemplateId_fkey" FOREIGN KEY ("campaignTemplateId") REFERENCES "CampaignTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientEventOptionTemplate" ADD CONSTRAINT "ClientEventOptionTemplate_clientEventTemplateId_fkey" FOREIGN KEY ("clientEventTemplateId") REFERENCES "ClientEventTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_campaignTemplateId_fkey" FOREIGN KEY ("campaignTemplateId") REFERENCES "CampaignTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectQuest" ADD CONSTRAINT "ProjectQuest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectQuest" ADD CONSTRAINT "ProjectQuest_questTemplateId_fkey" FOREIGN KEY ("questTemplateId") REFERENCES "QuestTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestAssignment" ADD CONSTRAINT "QuestAssignment_projectQuestId_fkey" FOREIGN KEY ("projectQuestId") REFERENCES "ProjectQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestAssignment" ADD CONSTRAINT "QuestAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestSubmission" ADD CONSTRAINT "QuestSubmission_projectQuestId_fkey" FOREIGN KEY ("projectQuestId") REFERENCES "ProjectQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestSubmission" ADD CONSTRAINT "QuestSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestSubmission" ADD CONSTRAINT "QuestSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestComment" ADD CONSTRAINT "QuestComment_projectQuestId_fkey" FOREIGN KEY ("projectQuestId") REFERENCES "ProjectQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestComment" ADD CONSTRAINT "QuestComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectClientEvent" ADD CONSTRAINT "ProjectClientEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalReport" ADD CONSTRAINT "FinalReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFinalReport" ADD CONSTRAINT "UserFinalReport_finalReportId_fkey" FOREIGN KEY ("finalReportId") REFERENCES "FinalReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFinalReport" ADD CONSTRAINT "UserFinalReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
