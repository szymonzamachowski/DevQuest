import { notFound } from "next/navigation";

import { ProjectDashboardView } from "@/features/quests/components/project-dashboard";
import { getProjectDashboard } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requireAuth();
  const data = await getProjectDashboard(projectId, session.user.id);
  if (!data) notFound();

  return (
    <ProjectDashboardView
      projectId={projectId}
      campaignTitle={data.project.campaignTemplate.title}
      chapterTitle={data.currentChapter?.title}
      stats={data.stats}
      health={data.health}
      healthRisks={data.healthRisks}
      pendingClientEvents={data.pendingClientEvents}
      latestClientMessage={data.latestClientMessage}
      latestAchievement={data.latestAchievement}
      workloads={data.workloads}
      workloadBalance={data.workloadBalance}
      teamHealth={data.teamHealth}
      mainQuest={data.mainQuest}
      availableQuests={data.availableQuests}
      lockedQuests={data.lockedQuests}
      myAssignments={data.myAssignments}
      members={data.project.members}
      activities={data.activities}
      userXp={data.user}
    />
  );
}
