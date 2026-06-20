import { ActivityType } from "@prisma/client";

import {
  clampHealth,
  getHealthBand,
  HEALTH_RULE_DELTAS,
  INITIAL_PROJECT_HEALTH,
  type HealthRuleKey,
} from "@/config/health-rules";
import { prisma } from "@/lib/db";

export type HealthChangeResult = {
  previousValue: number;
  newValue: number;
  delta: number;
  ruleKey: HealthRuleKey;
  reason: string;
  band: ReturnType<typeof getHealthBand>;
};

export async function applyHealthChange(
  projectId: string,
  params: {
    ruleKey: HealthRuleKey;
    reason: string;
    deltaOverride?: number;
    userId?: string;
  },
): Promise<HealthChangeResult> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const delta = params.deltaOverride ?? HEALTH_RULE_DELTAS[params.ruleKey];
  const previousValue = project.projectHealth;
  const newValue = clampHealth(previousValue + delta);

  if (delta === 0 && previousValue === newValue) {
    return {
      previousValue,
      newValue,
      delta: 0,
      ruleKey: params.ruleKey,
      reason: params.reason,
      band: getHealthBand(newValue),
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: { projectHealth: newValue },
    });

    await tx.projectHealthHistory.create({
      data: {
        projectId,
        userId: params.userId ?? null,
        previousValue,
        newValue,
        delta: newValue - previousValue,
        reason: params.reason,
        ruleKey: params.ruleKey,
      },
    });

    await tx.projectActivity.create({
      data: {
        projectId,
        userId: params.userId ?? null,
        type: ActivityType.HEALTH_CHANGED,
        title: `Project Health: ${previousValue} → ${newValue}`,
        description: params.reason,
        metadata: {
          previousValue,
          newValue,
          delta: newValue - previousValue,
          ruleKey: params.ruleKey,
          band: getHealthBand(newValue).key,
        },
      },
    });
  });

  return {
    previousValue,
    newValue,
    delta: newValue - previousValue,
    ruleKey: params.ruleKey,
    reason: params.reason,
    band: getHealthBand(newValue),
  };
}

export async function getProjectHealthSnapshot(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectHealth: true },
  });
  if (!project) return null;

  const history = await prisma.projectHealthHistory.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { id: true, name: true } } },
  });

  return {
    score: project.projectHealth,
    band: getHealthBand(project.projectHealth),
    history,
  };
}

export { getHealthBand, INITIAL_PROJECT_HEALTH, clampHealth };
