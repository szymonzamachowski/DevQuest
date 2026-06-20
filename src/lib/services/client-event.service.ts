import { ActivityType, ClientEventImportance } from "@prisma/client";

import { HEALTH_RULE_KEYS } from "@/config/health-rules";
import { prisma } from "@/lib/db";
import { evaluateAchievements } from "@/lib/services/achievement.service";
import { applyHealthChange } from "@/lib/services/project-health.service";
import { onCriticalIssueResolved } from "@/lib/services/project-health-evaluator.service";

const IMPORTANCE_BY_TITLE: Record<string, ClientEventImportance> = {
  "Unavailable dates": "NORMAL",
  Rescheduling: "NORMAL",
  "Double booking incident": "CRITICAL",
  "Earlier release": "HIGH",
  "Email notifications": "NORMAL",
};

export async function triggerClientEvent(
  projectId: string,
  templateId: string,
  actorUserId?: string,
) {
  const existing = await prisma.projectClientEvent.findFirst({
    where: { projectId, clientEventTemplateId: templateId },
  });
  if (existing) return existing;

  const template = await prisma.clientEventTemplate.findUnique({
    where: { id: templateId },
    include: { options: true },
  });
  if (!template) throw new Error("CLIENT_EVENT_TEMPLATE_NOT_FOUND");

  const deadline = template.responseDeadlineHours
    ? new Date(Date.now() + template.responseDeadlineHours * 60 * 60 * 1000)
    : null;

  const event = await prisma.$transaction(async (tx) => {
    const created = await tx.projectClientEvent.create({
      data: {
        projectId,
        clientEventTemplateId: templateId,
        importance: IMPORTANCE_BY_TITLE[template.title] ?? "NORMAL",
        responseDeadline: deadline,
      },
    });

    await tx.projectActivity.create({
      data: {
        projectId,
        userId: actorUserId ?? null,
        type: ActivityType.CLIENT_EVENT_TRIGGERED,
        title: `Client message: ${template.subject}`,
        description: template.message,
        metadata: {
          projectClientEventId: created.id,
          clientEventTemplateId: templateId,
          importance: IMPORTANCE_BY_TITLE[template.title] ?? "NORMAL",
        },
      },
    });

    return created;
  });

  return event;
}

export async function resolveClientEventDecision(params: {
  projectId: string;
  eventId: string;
  optionId: string;
  leaderResponse?: string;
  userId: string;
  isLeader: boolean;
  isSolo: boolean;
}) {
  if (!params.isLeader && !params.isSolo) {
    throw new Error("PERMISSION_DENIED");
  }

  const event = await prisma.projectClientEvent.findFirst({
    where: { id: params.eventId, projectId: params.projectId, status: "PENDING" },
    include: {
      clientEventTemplate: { include: { options: true } },
    },
  });
  if (!event) throw new Error("CLIENT_EVENT_NOT_FOUND");

  const option = event.clientEventTemplate.options.find((o) => o.id === params.optionId);
  if (!option) throw new Error("OPTION_NOT_FOUND");

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.projectClientEvent.update({
      where: { id: event.id },
      data: {
        status: "RESOLVED",
        respondedAt: now,
        selectedOptionId: option.id,
        leaderResponse: params.leaderResponse ?? null,
        resultingHealthChange: option.healthImpact,
        resultingXpChange: option.xpImpact,
        resultMessage: option.resultMessage,
        isRead: true,
      },
    });

    await tx.projectActivity.create({
      data: {
        projectId: params.projectId,
        userId: params.userId,
        type: ActivityType.CLIENT_EVENT_RESOLVED,
        title: `Client decision: ${event.clientEventTemplate.title}`,
        description: option.resultMessage,
        metadata: {
          projectClientEventId: event.id,
          optionId: option.id,
          decisionType: option.decisionType,
          healthImpact: option.healthImpact,
          xpImpact: option.xpImpact,
        },
      },
    });

    if (option.xpImpact > 0) {
      await tx.user.update({
        where: { id: params.userId },
        data: { totalXp: { increment: option.xpImpact } },
      });
      await tx.projectMember.update({
        where: { projectId_userId: { projectId: params.projectId, userId: params.userId } },
        data: { teamworkXp: { increment: Math.round(option.xpImpact * 0.2) } },
      });
    }
  });

  await applyHealthChange(params.projectId, {
    ruleKey: HEALTH_RULE_KEYS.CLIENT_DECISION,
    reason: `Client decision (${option.label}): ${option.resultMessage}`,
    deltaOverride: option.healthImpact,
    userId: params.userId,
  });

  if (event.importance === "CRITICAL" && option.decisionType !== "REJECT") {
    await onCriticalIssueResolved(params.projectId, event.clientEventTemplate.title, params.userId);
  }

  await evaluateAchievements(params.projectId, params.userId, {
    type: "CLIENT_EVENT_RESOLVED",
    decisionType: option.decisionType,
    eventTitle: event.clientEventTemplate.title,
  });

  return { ok: true as const, resultMessage: option.resultMessage };
}

export async function markClientEventRead(projectId: string, eventId: string) {
  await prisma.projectClientEvent.updateMany({
    where: { id: eventId, projectId },
    data: { isRead: true },
  });
}

export async function expireStaleClientEvents(projectId: string, userId?: string) {
  const now = new Date();
  const expired = await prisma.projectClientEvent.findMany({
    where: {
      projectId,
      status: "PENDING",
      responseDeadline: { lt: now },
    },
    include: { clientEventTemplate: true },
  });

  for (const event of expired) {
    await prisma.projectClientEvent.update({
      where: { id: event.id },
      data: { status: "EXPIRED" },
    });
    await applyHealthChange(projectId, {
      ruleKey: HEALTH_RULE_KEYS.EXPIRED_CLIENT_EVENT,
      reason: `Client event expired without response: ${event.clientEventTemplate.title}`,
      userId,
    });
  }

  return expired.length;
}

export async function addClientEventComment(
  projectId: string,
  eventId: string,
  authorId: string,
  content: string,
) {
  const event = await prisma.projectClientEvent.findFirst({
    where: { id: eventId, projectId },
  });
  if (!event) throw new Error("CLIENT_EVENT_NOT_FOUND");

  return prisma.clientEventComment.create({
    data: { projectClientEventId: eventId, authorId, content },
  });
}
