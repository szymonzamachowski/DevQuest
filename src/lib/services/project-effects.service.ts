import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { evaluateAchievements } from "@/lib/services/achievement.service";
import { evaluateClientEventTriggers } from "@/lib/services/client-event-trigger.service";
import { expireStaleClientEvents } from "@/lib/services/client-event.service";
import {
  evaluateProjectHealthSignals,
  onQualityQuestCompleted,
  onSubmissionRejected,
} from "@/lib/services/project-health-evaluator.service";

export async function onQuestStarted(
  projectId: string,
  questTitle: string,
  userId: string,
  questId: string,
) {
  await prisma.projectActivity.create({
    data: {
      projectId,
      userId,
      type: ActivityType.QUEST_STARTED,
      title: `Quest started: ${questTitle}`,
      description: `${questTitle} moved to In Progress.`,
      metadata: { projectQuestId: questId, category: "quest" },
    },
  });
}

export async function onQuestCompleted(
  projectId: string,
  params: {
    questId: string;
    questSlug: string;
    questTitle: string;
    category: string;
    chapterOrder: number;
    userId: string;
  },
) {
  await prisma.projectMember.updateMany({
    where: {
      projectId,
      userId: params.userId,
    },
    data: { contributionScore: { increment: 10 } },
  });

  await evaluateClientEventTriggers(
    projectId,
    { type: "QUEST_COMPLETED", questSlug: params.questSlug },
    params.userId,
  );

  if (params.chapterOrder >= 3) {
    await evaluateClientEventTriggers(
      projectId,
      { type: "CHAPTER_START", chapterOrder: params.chapterOrder },
      params.userId,
    );
  }

  await evaluateClientEventTriggers(projectId, { type: "TIME_CHECK" }, params.userId);
  await expireStaleClientEvents(projectId, params.userId);

  await onQualityQuestCompleted(
    projectId,
    params.category as never,
    params.questTitle,
    params.userId,
  );

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  await evaluateAchievements(projectId, params.userId, {
    type: "QUEST_COMPLETED",
    questSlug: params.questSlug,
    projectHealth: project?.projectHealth,
    chapterOrder: params.chapterOrder,
  });

  await evaluateProjectHealthSignals(projectId, params.userId);
}

export async function onQuestChangesRequested(
  projectId: string,
  questTitle: string,
  userId: string,
) {
  await onSubmissionRejected(projectId, questTitle, userId);
  await evaluateProjectHealthSignals(projectId, userId);
}

export async function onDashboardLoad(projectId: string, userId: string) {
  await expireStaleClientEvents(projectId, userId);
  await evaluateClientEventTriggers(projectId, { type: "TIME_CHECK" }, userId);
  await evaluateProjectHealthSignals(projectId, userId);
}
