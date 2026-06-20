import type { ProjectQuestStatus, QuestCategory } from "@prisma/client";

import { HEALTH_RULE_KEYS } from "@/config/health-rules";
import { prisma } from "@/lib/db";
import { applyHealthChange } from "@/lib/services/project-health.service";

const QUALITY_CATEGORIES: QuestCategory[] = ["TESTING", "DOCUMENTATION", "DEVOPS"];

export async function evaluateOverdueQuests(projectId: string, userId?: string) {
  const now = new Date();
  const overdue = await prisma.projectQuest.findMany({
    where: {
      projectId,
      status: { in: ["AVAILABLE", "IN_PROGRESS", "CHANGES_REQUIRED"] },
      suggestedDeadline: { lt: now },
    },
    include: { questTemplate: { select: { title: true } } },
    take: 5,
  });

  for (const quest of overdue) {
    await applyHealthChange(projectId, {
      ruleKey: HEALTH_RULE_KEYS.OVERDUE_QUEST,
      reason: `Quest overdue: ${quest.questTemplate.title}`,
      userId,
    });
  }

  return overdue.length;
}

export async function onSubmissionRejected(projectId: string, questTitle: string, userId?: string) {
  return applyHealthChange(projectId, {
    ruleKey: HEALTH_RULE_KEYS.REJECTED_SUBMISSION,
    reason: `Submission rejected for quest: ${questTitle}`,
    userId,
  });
}

export async function onQualityQuestCompleted(
  projectId: string,
  category: QuestCategory,
  questTitle: string,
  userId?: string,
) {
  if (!QUALITY_CATEGORIES.includes(category)) return null;
  return applyHealthChange(projectId, {
    ruleKey: HEALTH_RULE_KEYS.QUALITY_QUEST_COMPLETED,
    reason: `Quality quest completed: ${questTitle}`,
    userId,
  });
}

export async function onCriticalIssueResolved(
  projectId: string,
  eventTitle: string,
  userId?: string,
) {
  return applyHealthChange(projectId, {
    ruleKey: HEALTH_RULE_KEYS.CRITICAL_ISSUE_RESOLVED,
    reason: `Critical client issue resolved: ${eventTitle}`,
    userId,
  });
}

export async function evaluateProjectHealthSignals(projectId: string, userId?: string) {
  const quests = await prisma.projectQuest.findMany({
    where: { projectId },
    include: {
      questTemplate: { select: { category: true, chapterTemplate: { select: { order: true } } } },
    },
  });

  const chapterOrder = Math.max(...quests.map((q) => q.questTemplate.chapterTemplate.order), 1);

  const results: string[] = [];

  if (chapterOrder >= 2) {
    const testingDone = quests.some(
      (q) => q.questTemplate.category === "TESTING" && q.status === "COMPLETED",
    );
    if (!testingDone) {
      await applyHealthChange(projectId, {
        ruleKey: HEALTH_RULE_KEYS.NO_TESTING_COVERAGE,
        reason: "No testing quests completed while progressing through Core Booking.",
        userId,
      });
      results.push("NO_TESTING_COVERAGE");
    }
  }

  if (chapterOrder >= 3) {
    const docsDone = quests.some(
      (q) => q.questTemplate.category === "DOCUMENTATION" && q.status === "COMPLETED",
    );
    if (!docsDone) {
      await applyHealthChange(projectId, {
        ruleKey: HEALTH_RULE_KEYS.NO_DOCUMENTATION_COVERAGE,
        reason: "Release chapter started without documentation quest completed.",
        userId,
      });
      results.push("NO_DOCUMENTATION_COVERAGE");
    }
  }

  const assignments = await prisma.questAssignment.groupBy({
    by: ["userId"],
    where: {
      projectQuest: {
        projectId,
        status: { in: ["IN_PROGRESS", "REVIEW", "CHANGES_REQUIRED"] as ProjectQuestStatus[] },
      },
    },
    _count: { userId: true },
  });

  if (assignments.length >= 2) {
    const counts = assignments.map((a) => a._count.userId);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    if (max - min >= 2) {
      await applyHealthChange(projectId, {
        ruleKey: HEALTH_RULE_KEYS.UNEVEN_WORKLOAD,
        reason: "Active quest workload is uneven across team members.",
        userId,
      });
      results.push("UNEVEN_WORKLOAD");
    }
  }

  await evaluateOverdueQuests(projectId, userId);

  const pendingEvents = await prisma.projectClientEvent.count({
    where: { projectId, status: "PENDING" },
  });
  if (pendingEvents > 0) {
    results.push("PENDING_CLIENT_EVENTS");
  }

  return results;
}
