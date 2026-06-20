import { redirect } from "next/navigation";

import { getUserActiveProject } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/db";

export default async function ReportRedirectPage() {
  const session = await requireAuth();
  const active = await getUserActiveProject(session.user.id);

  if (active) {
    redirect(`/app/projects/${active.id}/report`);
  }

  const completed = await prisma.project.findFirst({
    where: {
      status: "COMPLETED",
      members: { some: { userId: session.user.id } },
    },
    orderBy: { completedAt: "desc" },
    select: { id: true },
  });

  if (completed) {
    redirect(`/app/projects/${completed.id}/report`);
  }

  redirect("/app/campaigns");
}
