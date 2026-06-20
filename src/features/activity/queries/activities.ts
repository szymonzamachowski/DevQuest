import type { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/db";

export type ActivityFilters = {
  userId?: string;
  type?: ActivityType;
  category?: string;
  from?: Date;
  to?: Date;
};

export const ACTIVITY_CATEGORIES: Record<string, ActivityType[]> = {
  quest: ["QUEST_UNLOCKED", "QUEST_STARTED", "QUEST_ASSIGNED", "QUEST_SUBMITTED", "QUEST_REVIEWED"],
  client: ["CLIENT_EVENT_TRIGGERED", "CLIENT_EVENT_RESOLVED"],
  health: ["HEALTH_CHANGED"],
  xp: ["XP_AWARDED"],
  achievement: ["ACHIEVEMENT_UNLOCKED"],
  team: ["ROLE_CHANGED"],
};

export async function getProjectActivities(
  projectId: string,
  filters: ActivityFilters = {},
  limit = 50,
) {
  const types =
    filters.category && ACTIVITY_CATEGORIES[filters.category]
      ? ACTIVITY_CATEGORIES[filters.category]
      : filters.type
        ? [filters.type]
        : undefined;

  return prisma.projectActivity.findMany({
    where: {
      projectId,
      userId: filters.userId,
      type: types ? { in: types } : undefined,
      createdAt: {
        gte: filters.from,
        lte: filters.to,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}
