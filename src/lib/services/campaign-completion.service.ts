import { ProjectStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export type CompletionEligibility = {
  eligible: boolean;
  missing: string[];
  stats: {
    requiredMainTotal: number;
    requiredMainCompleted: number;
    optionalCompleted: number;
    optionalTotal: number;
    unresolvedCriticalEvents: number;
    pendingClientEvents: number;
  };
};

export async function checkCampaignCompletionEligibility(
  projectId: string,
): Promise<CompletionEligibility> {
  const [quests, clientEvents] = await Promise.all([
    prisma.projectQuest.findMany({
      where: { projectId },
      include: {
        questTemplate: {
          select: { title: true, isRequired: true, isMainQuest: true, slug: true },
        },
      },
    }),
    prisma.projectClientEvent.findMany({
      where: { projectId },
      include: { clientEventTemplate: { select: { title: true } } },
    }),
  ]);

  const requiredMain = quests.filter(
    (q) => q.questTemplate.isRequired && q.questTemplate.isMainQuest,
  );
  const incompleteMain = requiredMain.filter((q) => q.status !== "COMPLETED");

  const optional = quests.filter((q) => !q.questTemplate.isRequired);
  const optionalCompleted = optional.filter((q) => q.status === "COMPLETED");

  const unresolvedCritical = clientEvents.filter(
    (e) => e.importance === "CRITICAL" && (e.status === "PENDING" || e.status === "EXPIRED"),
  );

  const pendingEvents = clientEvents.filter((e) => e.status === "PENDING");

  const missing: string[] = [];

  for (const q of incompleteMain) {
    missing.push(`Required main quest not completed: ${q.questTemplate.title}`);
  }

  for (const e of unresolvedCritical) {
    missing.push(`Critical client event unresolved: ${e.clientEventTemplate.title}`);
  }

  return {
    eligible: missing.length === 0,
    missing,
    stats: {
      requiredMainTotal: requiredMain.length,
      requiredMainCompleted: requiredMain.length - incompleteMain.length,
      optionalCompleted: optionalCompleted.length,
      optionalTotal: optional.length,
      unresolvedCriticalEvents: unresolvedCritical.length,
      pendingClientEvents: pendingEvents.length,
    },
  };
}

export function canCompleteCampaign(params: {
  eligibility: CompletionEligibility;
  isLeader: boolean;
  isSolo: boolean;
  projectStatus: ProjectStatus;
}): { allowed: boolean; reason?: string } {
  if (params.projectStatus === "COMPLETED") {
    return { allowed: false, reason: "ALREADY_COMPLETED" };
  }
  if (!params.isLeader && !params.isSolo) {
    return { allowed: false, reason: "LEADER_REQUIRED" };
  }
  if (!params.eligibility.eligible) {
    return { allowed: false, reason: "REQUIREMENTS_NOT_MET" };
  }
  return { allowed: true };
}
