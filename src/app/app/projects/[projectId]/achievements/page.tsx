import { notFound } from "next/navigation";

import { AchievementsView } from "@/features/achievements/components/achievements-view";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/services/achievement.service";
import { getProjectForMember } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/db";

export default async function ProjectAchievementsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requireAuth();
  const access = await getProjectForMember(projectId, session.user.id);
  if (!access) notFound();

  const [unlocked, achievements] = await Promise.all([
    prisma.userAchievement.findMany({
      where: { projectId, userId: session.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.achievement.findMany({ orderBy: { title: "asc" } }),
  ]);

  const recentNotification = unlocked[0] ?? null;

  return (
    <AchievementsView
      unlocked={unlocked}
      all={achievements.length > 0 ? achievements : ACHIEVEMENT_DEFINITIONS}
      recentNotification={recentNotification}
    />
  );
}
