import { ProjectStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getHealthBand } from "@/config/health-rules";
import { onDashboardLoad } from "@/lib/services/project-effects.service";
import { getProjectHealthSnapshot } from "@/lib/services/project-health.service";
import {
  calculateTeamHealth,
  calculateWorkloadBalance,
  getTeamWorkload,
} from "@/lib/services/team-workload.service";
import {
  evaluateAndUnlockQuests,
  initializeProjectQuests,
} from "@/lib/services/quest-unlock.service";

export async function getUserActiveProject(userId: string) {
  return prisma.project.findFirst({
    where: {
      status: ProjectStatus.ACTIVE,
      members: { some: { userId } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      campaignTemplate: true,
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, totalXp: true, level: true } },
        },
      },
    },
  });
}

export async function getProjectForMember(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      campaignTemplate: {
        include: {
          chapters: { orderBy: { order: "asc" } },
        },
      },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, totalXp: true, level: true } },
        },
      },
      leader: { select: { id: true, name: true, email: true } },
      finalReport: true,
    },
  });
  if (!project) return null;
  const membership = project.members.find((m) => m.userId === userId);
  if (!membership) return null;
  return { project, membership };
}

export async function getProjectDashboard(projectId: string, userId: string) {
  const access = await getProjectForMember(projectId, userId);
  if (!access) return null;

  if (access.project.status === ProjectStatus.ACTIVE) {
    const questCount = await prisma.projectQuest.count({ where: { projectId } });
    if (questCount === 0) {
      await initializeProjectQuests(projectId);
      await evaluateAndUnlockQuests(projectId, userId);
    }
    await onDashboardLoad(projectId, userId);
  }

  const [quests, activities, user, health, clientEvents, latestAchievement, workloads] =
    await Promise.all([
      prisma.projectQuest.findMany({
        where: { projectId },
        include: {
          questTemplate: {
            include: {
              chapterTemplate: true,
              dependencies: {
                include: {
                  dependsOnQuestTemplate: { select: { id: true, slug: true, title: true } },
                },
              },
              skillRewards: { include: { skill: true } },
            },
          },
          assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
          submissions: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: [
          { questTemplate: { chapterTemplate: { order: "asc" } } },
          { questTemplate: { order: "asc" } },
        ],
      }),
      prisma.projectActivity.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, totalXp: true, level: true },
      }),
      getProjectHealthSnapshot(projectId),
      prisma.projectClientEvent.findMany({
        where: { projectId },
        orderBy: { triggeredAt: "desc" },
        take: 5,
        include: { clientEventTemplate: { select: { title: true, subject: true, message: true } } },
      }),
      prisma.userAchievement.findFirst({
        where: { projectId, userId },
        orderBy: { unlockedAt: "desc" },
        include: { achievement: true },
      }),
      getTeamWorkload(projectId),
    ]);

  const currentChapter = access.project.campaignTemplate.chapters.find(
    (c) => c.id === access.project.currentChapterId,
  );

  const requiredQuests = quests.filter((q) => q.questTemplate.isRequired);
  const completedRequired = requiredQuests.filter((q) => q.status === "COMPLETED");
  const chapterQuests = quests.filter(
    (q) => q.questTemplate.chapterTemplateId === access.project.currentChapterId,
  );
  const chapterRequired = chapterQuests.filter((q) => q.questTemplate.isRequired);
  const chapterCompleted = chapterRequired.filter((q) => q.status === "COMPLETED");

  const mainQuest = quests.find(
    (q) =>
      q.questTemplate.isMainQuest &&
      q.status !== "COMPLETED" &&
      q.status !== "FAILED" &&
      q.status !== "LOCKED",
  );

  const myAssignments = quests.filter((q) => q.assignments.some((a) => a.userId === userId));

  const pendingClientEvents = clientEvents.filter((e) => e.status === "PENDING");
  const workloadBalance = calculateWorkloadBalance(workloads);
  const teamHealth = calculateTeamHealth(
    access.project.projectHealth,
    workloadBalance,
    pendingClientEvents.length,
  );

  const healthRisks: string[] = [];
  if (pendingClientEvents.length > 0) {
    healthRisks.push(`${pendingClientEvents.length} unresolved client event(s)`);
  }
  if (workloadBalance.label !== "balanced") {
    healthRisks.push("Uneven workload across team members");
  }
  if (
    quests.some(
      (q) => q.status !== "COMPLETED" && q.suggestedDeadline && q.suggestedDeadline < new Date(),
    )
  ) {
    healthRisks.push("Overdue quests detected");
  }

  return {
    ...access,
    currentChapter,
    quests,
    activities,
    user,
    health: health ?? {
      score: access.project.projectHealth,
      band: getHealthBand(access.project.projectHealth),
      history: [],
    },
    clientEvents,
    pendingClientEvents,
    latestClientMessage: clientEvents[0] ?? null,
    latestAchievement,
    workloads,
    workloadBalance,
    teamHealth,
    healthRisks,
    stats: {
      campaignProgress:
        requiredQuests.length > 0
          ? Math.round((completedRequired.length / requiredQuests.length) * 100)
          : 0,
      chapterProgress:
        chapterRequired.length > 0
          ? Math.round((chapterCompleted.length / chapterRequired.length) * 100)
          : 0,
      availableCount: quests.filter((q) => q.status === "AVAILABLE").length,
      lockedCount: quests.filter((q) => q.status === "LOCKED").length,
    },
    mainQuest,
    availableQuests: quests.filter((q) => q.status === "AVAILABLE"),
    lockedQuests: quests.filter((q) => q.status === "LOCKED").slice(0, 6),
    myAssignments,
  };
}

export async function getProjectQuestBoard(projectId: string, userId: string) {
  const access = await getProjectForMember(projectId, userId);
  if (!access) return null;

  const quests = await prisma.projectQuest.findMany({
    where: { projectId },
    include: {
      questTemplate: {
        include: {
          chapterTemplate: true,
          dependencies: {
            include: {
              dependsOnQuestTemplate: { select: { id: true, slug: true, title: true } },
            },
          },
        },
      },
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
      submissions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [
      { questTemplate: { chapterTemplate: { order: "asc" } } },
      { questTemplate: { order: "asc" } },
    ],
  });

  return { ...access, quests };
}

export async function getProjectQuestDetail(projectId: string, questId: string, userId: string) {
  const access = await getProjectForMember(projectId, userId);
  if (!access) return null;

  const quest = await prisma.projectQuest.findFirst({
    where: { id: questId, projectId },
    include: {
      questTemplate: {
        include: {
          chapterTemplate: true,
          dependencies: {
            include: {
              dependsOnQuestTemplate: {
                select: { id: true, slug: true, title: true, isRequired: true },
              },
            },
          },
          skillRewards: { include: { skill: true } },
        },
      },
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
      submissions: {
        orderBy: { createdAt: "desc" },
        include: {
          submittedBy: { select: { id: true, name: true, email: true } },
          reviewedBy: { select: { id: true, name: true, email: true } },
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!quest) return null;

  const dependencyStatuses = await prisma.projectQuest.findMany({
    where: {
      projectId,
      questTemplateId: {
        in: quest.questTemplate.dependencies.map((d) => d.dependsOnQuestTemplateId),
      },
    },
    select: {
      questTemplateId: true,
      status: true,
      questTemplate: { select: { title: true, slug: true } },
    },
  });

  return { ...access, quest, dependencyStatuses };
}

export async function getProjectRoadmap(projectId: string, userId: string) {
  const access = await getProjectForMember(projectId, userId);
  if (!access) return null;

  const quests = await prisma.projectQuest.findMany({
    where: { projectId },
    include: {
      questTemplate: {
        include: {
          chapterTemplate: true,
          dependencies: true,
        },
      },
    },
    orderBy: [
      { questTemplate: { chapterTemplate: { order: "asc" } } },
      { questTemplate: { order: "asc" } },
    ],
  });

  return { ...access, quests };
}
