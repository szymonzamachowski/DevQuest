import { notFound } from "next/navigation";

import { getProjectForMember } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";

/** Gate every project page on membership; the app shell derives project nav from the URL. */
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

  return children;
}
