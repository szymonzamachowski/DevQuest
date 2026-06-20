import { notFound } from "next/navigation";

import { QuestDetailView } from "@/features/quests/components/quest-detail-view";
import { getProjectQuestDetail } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";

export default async function ProjectQuestDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; questId: string }>;
}) {
  const { projectId, questId } = await params;
  const session = await requireAuth();
  const data = await getProjectQuestDetail(projectId, questId, session.user.id);
  if (!data) notFound();

  return (
    <QuestDetailView
      projectId={projectId}
      questId={questId}
      mode={data.project.mode}
      isLeader={data.membership.role === "LEADER"}
      currentUserId={session.user.id}
      quest={data.quest}
      members={data.project.members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
      }))}
      dependencyStatuses={data.dependencyStatuses}
    />
  );
}
