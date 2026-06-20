import { notFound } from "next/navigation";
import type { ActivityType } from "@prisma/client";

import { ActivityTimelineView } from "@/features/activity/components/activity-timeline-view";
import { getProjectActivities } from "@/features/activity/queries/activities";
import { getProjectForMember } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";

export default async function ProjectActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ userId?: string; category?: string; type?: string }>;
}) {
  const { projectId } = await params;
  const filters = await searchParams;
  const session = await requireAuth();
  const access = await getProjectForMember(projectId, session.user.id);
  if (!access) notFound();

  const activities = await getProjectActivities(projectId, {
    userId: filters.userId,
    category: filters.category,
    type: filters.type as ActivityType | undefined,
  });

  return (
    <ActivityTimelineView
      projectId={projectId}
      activities={activities}
      members={access.project.members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
      }))}
      filters={filters}
    />
  );
}
