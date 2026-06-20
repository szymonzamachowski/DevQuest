import { notFound } from "next/navigation";

import { ProjectShellProvider } from "@/components/layout/project-shell-context";
import { getProjectForMember } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requireAuth();
  const access = await getProjectForMember(projectId, session.user.id);
  if (!access) notFound();

  const currentChapter = access.project.campaignTemplate.chapters.find(
    (c) => c.id === access.project.currentChapterId,
  );

  return (
    <ProjectShellProvider
      project={{
        id: access.project.id,
        title: access.project.title,
        campaignTitle: access.project.campaignTemplate.title,
        chapterTitle: currentChapter?.title ?? null,
      }}
    >
      {children}
    </ProjectShellProvider>
  );
}
