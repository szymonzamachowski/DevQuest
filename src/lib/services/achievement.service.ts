import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/db";

export type AchievementDefinition = {
  key: string;
  title: string;
  description: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    key: "first_deployment",
    title: "First Deployment",
    description: "Completed the deployment preparation quest.",
    icon: "rocket",
    rarity: "COMMON",
  },
  {
    key: "clean_handoff",
    title: "Clean Handoff",
    description: "Completed client review with project health above 70.",
    icon: "handshake",
    rarity: "RARE",
  },
  {
    key: "review_guardian",
    title: "Review Guardian",
    description: "Accepted three quest submissions as team leader.",
    icon: "shield",
    rarity: "RARE",
  },
  {
    key: "zero_critical_bugs",
    title: "Zero Critical Bugs",
    description: "Resolved the double booking incident without health dropping below 50.",
    icon: "bug",
    rarity: "EPIC",
  },
  {
    key: "team_player",
    title: "Team Player",
    description: "Earned at least 100 teamwork XP on the project.",
    icon: "users",
    rarity: "COMMON",
  },
  {
    key: "scope_negotiator",
    title: "Scope Negotiator",
    description: "Resolved a client event with a limited or deferred decision.",
    icon: "scale",
    rarity: "RARE",
  },
  {
    key: "reliable_contributor",
    title: "Reliable Contributor",
    description: "Completed five quests on the project.",
    icon: "check-circle",
    rarity: "COMMON",
  },
  {
    key: "release_survivor",
    title: "Release Survivor",
    description: "Reached the Release chapter with health above 25.",
    icon: "flag",
    rarity: "EPIC",
  },
];

export async function unlockAchievement(projectId: string, userId: string, achievementKey: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true },
  });
  if (project?.status === "COMPLETED") return null;

  const achievement = await prisma.achievement.findUnique({ where: { key: achievementKey } });
  if (!achievement) return null;

  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId_projectId: {
        userId,
        achievementId: achievement.id,
        projectId,
      },
    },
  });
  if (existing) return null;

  await prisma.$transaction(async (tx) => {
    await tx.userAchievement.create({
      data: { userId, achievementId: achievement.id, projectId },
    });

    await tx.projectActivity.create({
      data: {
        projectId,
        userId,
        type: ActivityType.ACHIEVEMENT_UNLOCKED,
        title: `Achievement unlocked: ${achievement.title}`,
        description: achievement.description,
        metadata: { achievementKey, rarity: achievement.rarity },
      },
    });
  });

  return achievement;
}

export async function evaluateAchievements(
  projectId: string,
  userId: string,
  context: {
    type: string;
    questSlug?: string;
    decisionType?: string;
    eventTitle?: string;
    projectHealth?: number;
    chapterOrder?: number;
  },
) {
  const unlocked: string[] = [];

  const [completedCount, acceptedReviews, member, project, doubleBookingEvent] = await Promise.all([
    prisma.projectQuest.count({
      where: { projectId, status: "COMPLETED", assignments: { some: { userId } } },
    }),
    prisma.questSubmission.count({
      where: {
        status: "ACCEPTED",
        reviewedById: userId,
        projectQuest: { projectId },
      },
    }),
    prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    }),
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.projectClientEvent.findFirst({
      where: {
        projectId,
        status: "RESOLVED",
        clientEventTemplate: { title: "Double booking incident" },
      },
    }),
  ]);

  if (context.type === "QUEST_COMPLETED" && context.questSlug === "prepare-deployment") {
    const a = await unlockAchievement(projectId, userId, "first_deployment");
    if (a) unlocked.push(a.key);
  }

  if (
    context.type === "QUEST_COMPLETED" &&
    context.questSlug === "client-review" &&
    (context.projectHealth ?? project?.projectHealth ?? 0) > 70
  ) {
    const a = await unlockAchievement(projectId, userId, "clean_handoff");
    if (a) unlocked.push(a.key);
  }

  if (acceptedReviews >= 3) {
    const a = await unlockAchievement(projectId, userId, "review_guardian");
    if (a) unlocked.push(a.key);
  }

  if (
    context.type === "CLIENT_EVENT_RESOLVED" &&
    context.eventTitle === "Double booking incident" &&
    doubleBookingEvent &&
    (project?.projectHealth ?? 0) >= 50
  ) {
    const a = await unlockAchievement(projectId, userId, "zero_critical_bugs");
    if (a) unlocked.push(a.key);
  }

  if ((member?.teamworkXp ?? 0) >= 100) {
    const a = await unlockAchievement(projectId, userId, "team_player");
    if (a) unlocked.push(a.key);
  }

  if (
    context.type === "CLIENT_EVENT_RESOLVED" &&
    (context.decisionType === "LIMITED" || context.decisionType === "DEFER")
  ) {
    const a = await unlockAchievement(projectId, userId, "scope_negotiator");
    if (a) unlocked.push(a.key);
  }

  if (completedCount >= 5) {
    const a = await unlockAchievement(projectId, userId, "reliable_contributor");
    if (a) unlocked.push(a.key);
  }

  if (
    context.chapterOrder !== undefined &&
    context.chapterOrder >= 3 &&
    (project?.projectHealth ?? 0) > 25
  ) {
    const a = await unlockAchievement(projectId, userId, "release_survivor");
    if (a) unlocked.push(a.key);
  }

  return unlocked;
}
