import { ActivityType, ProjectQuestStatus, type Prisma, type QuestTemplate } from "@prisma/client";

import { prisma } from "@/lib/db";

type QuestWithDeps = {
  id: string;
  questTemplateId: string;
  status: ProjectQuestStatus;
  questTemplate: {
    dependencies: Array<{
      dependsOnQuestTemplateId: string;
      dependsOnQuestTemplate: Pick<QuestTemplate, "id" | "isRequired" | "slug" | "title">;
    }>;
  };
};

export function areDependenciesSatisfied(
  quest: QuestWithDeps,
  questsByTemplateId: Map<string, QuestWithDeps>,
): boolean {
  if (quest.questTemplate.dependencies.length === 0) return true;

  return quest.questTemplate.dependencies.every((dep) => {
    const prerequisite = questsByTemplateId.get(dep.dependsOnQuestTemplateId);
    if (!prerequisite) return false;
    if (prerequisite.status !== ProjectQuestStatus.COMPLETED) {
      return !dep.dependsOnQuestTemplate.isRequired;
    }
    return true;
  });
}

export function computeSuggestedDeadline(unlockedAt: Date, estimatedMinutes: number): Date {
  const deadline = new Date(unlockedAt);
  deadline.setMinutes(deadline.getMinutes() + estimatedMinutes);
  return deadline;
}

export async function initializeProjectQuests(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projectQuests: { select: { id: true } },
      campaignTemplate: {
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: { quests: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  if (project.projectQuests.length > 0) return;

  const templates = project.campaignTemplate.chapters.flatMap((c) => c.quests);
  const startedAt = project.startedAt ?? new Date();

  await prisma.projectQuest.createMany({
    data: templates.map((template) => ({
      projectId,
      questTemplateId: template.id,
      status: ProjectQuestStatus.LOCKED,
      suggestedDeadline: computeSuggestedDeadline(startedAt, template.estimatedMinutes),
    })),
  });
}

export async function evaluateAndUnlockQuests(
  projectId: string,
  actorUserId?: string,
): Promise<string[]> {
  const quests = await prisma.projectQuest.findMany({
    where: { projectId, status: ProjectQuestStatus.LOCKED },
    include: {
      questTemplate: {
        include: {
          dependencies: {
            include: {
              dependsOnQuestTemplate: {
                select: { id: true, isRequired: true, slug: true, title: true },
              },
            },
          },
        },
      },
    },
  });

  if (quests.length === 0) return [];

  const allQuests = await prisma.projectQuest.findMany({
    where: { projectId },
    include: {
      questTemplate: {
        include: {
          dependencies: {
            include: {
              dependsOnQuestTemplate: {
                select: { id: true, isRequired: true, slug: true, title: true },
              },
            },
          },
        },
      },
    },
  });

  const byTemplateId = new Map(allQuests.map((q) => [q.questTemplateId, q]));
  const unlockedIds: string[] = [];
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    for (const quest of quests) {
      if (!areDependenciesSatisfied(quest, byTemplateId)) continue;

      await tx.projectQuest.update({
        where: { id: quest.id },
        data: {
          status: ProjectQuestStatus.AVAILABLE,
          unlockedAt: now,
          suggestedDeadline: computeSuggestedDeadline(now, quest.questTemplate.estimatedMinutes),
        },
      });

      await tx.projectActivity.create({
        data: {
          projectId,
          userId: actorUserId ?? null,
          type: ActivityType.QUEST_UNLOCKED,
          title: `Quest unlocked: ${quest.questTemplate.title}`,
          description: `${quest.questTemplate.title} is now available.`,
          metadata: {
            projectQuestId: quest.id,
            questTemplateId: quest.questTemplateId,
            questSlug: quest.questTemplate.slug,
          } satisfies Prisma.InputJsonValue,
        },
      });

      unlockedIds.push(quest.id);
      byTemplateId.set(quest.questTemplateId, {
        ...quest,
        status: ProjectQuestStatus.AVAILABLE,
        unlockedAt: now,
      });
    }
  });

  return unlockedIds;
}
