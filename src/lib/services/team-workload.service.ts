import type { ProjectQuestStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export type MemberWorkload = {
  userId: string;
  name: string | null;
  email: string;
  activeQuests: number;
  completedQuests: number;
  contributionScore: number;
  teamworkXp: number;
  isBlocked: boolean;
  isInactive: boolean;
};

export function calculateWorkloadBalance(workloads: MemberWorkload[]): {
  score: number;
  label: "balanced" | "uneven" | "critical";
  spread: number;
} {
  if (workloads.length === 0) return { score: 100, label: "balanced", spread: 0 };
  const active = workloads.map((w) => w.activeQuests);
  const spread = Math.max(...active) - Math.min(...active);
  if (spread <= 1) return { score: 90, label: "balanced", spread };
  if (spread === 2) return { score: 65, label: "uneven", spread };
  return { score: 40, label: "critical", spread };
}

export async function getTeamWorkload(projectId: string): Promise<MemberWorkload[]> {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const activeStatuses: ProjectQuestStatus[] = ["IN_PROGRESS", "REVIEW", "CHANGES_REQUIRED"];

  const workloads = await Promise.all(
    members.map(async (member) => {
      const [activeQuests, completedQuests, lastActivity] = await Promise.all([
        prisma.questAssignment.count({
          where: {
            userId: member.userId,
            projectQuest: { projectId, status: { in: activeStatuses } },
          },
        }),
        prisma.questAssignment.count({
          where: {
            userId: member.userId,
            projectQuest: { projectId, status: "COMPLETED" },
          },
        }),
        prisma.projectActivity.findFirst({
          where: { projectId, userId: member.userId },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);

      const inactiveDays = lastActivity
        ? (Date.now() - lastActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      return {
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        activeQuests,
        completedQuests,
        contributionScore: member.contributionScore,
        teamworkXp: member.teamworkXp,
        isBlocked: activeQuests >= 3,
        isInactive: inactiveDays > 7,
      };
    }),
  );

  return workloads;
}

export function calculateTeamHealth(
  projectHealth: number,
  workload: ReturnType<typeof calculateWorkloadBalance>,
  pendingEvents: number,
): { score: number; label: string } {
  let score = projectHealth;
  if (workload.label === "uneven") score -= 5;
  if (workload.label === "critical") score -= 10;
  score -= pendingEvents * 3;
  score = Math.max(0, Math.min(100, score));
  const label =
    score >= 85
      ? "Excellent"
      : score >= 70
        ? "Stable"
        : score >= 50
          ? "At Risk"
          : score >= 25
            ? "Critical"
            : "Failed";
  return { score, label };
}
