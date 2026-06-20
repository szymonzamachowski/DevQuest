import { redirect } from "next/navigation";

import { getUserActiveProject } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";

export default async function AppHomePage() {
  const session = await requireAuth();
  const project = await getUserActiveProject(session.user.id);

  if (project) {
    redirect(`/app/projects/${project.id}`);
  }

  redirect("/app/campaigns");
}
