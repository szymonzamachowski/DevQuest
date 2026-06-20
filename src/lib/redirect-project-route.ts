import { redirect } from "next/navigation";

import { getUserActiveProject } from "@/features/quests/queries/project-quests";
import { prisma } from "@/lib/db";

export async function redirectToProjectRoute(userId: string, pathSuffix: string) {
  const active = await getUserActiveProject(userId);
  if (active) {
    redirect(`/app/projects/${active.id}${pathSuffix}`);
  }

  const completed = await prisma.project.findFirst({
    where: {
      status: "COMPLETED",
      members: { some: { userId } },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (completed) {
    redirect(`/app/projects/${completed.id}${pathSuffix}`);
  }

  redirect("/app/campaigns");
}
