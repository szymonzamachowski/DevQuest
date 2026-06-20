import { notFound } from "next/navigation";

import { RoadmapView } from "@/features/quests/components/roadmap-view";
import { getProjectRoadmap } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";

export default async function ProjectRoadmapPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requireAuth();
  const data = await getProjectRoadmap(projectId, session.user.id);
  if (!data) notFound();

  return (
    <RoadmapView
      projectId={projectId}
      quests={data.quests}
      chapters={data.project.campaignTemplate.chapters}
    />
  );
}
