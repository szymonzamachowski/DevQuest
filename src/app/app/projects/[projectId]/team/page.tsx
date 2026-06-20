import { notFound } from "next/navigation";

import { TeamView } from "@/features/team/components/team-view";
import { getProjectActivities } from "@/features/activity/queries/activities";
import { getProjectForMember } from "@/features/quests/queries/project-quests";
import {
  calculateTeamHealth,
  calculateWorkloadBalance,
  getTeamWorkload,
} from "@/lib/services/team-workload.service";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/db";

export default async function ProjectTeamPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requireAuth();
  const access = await getProjectForMember(projectId, session.user.id);
  if (!access) notFound();

  const [workloads, activities, pendingEvents] = await Promise.all([
    getTeamWorkload(projectId),
    getProjectActivities(projectId, {}, 8),
    prisma.projectClientEvent.count({ where: { projectId, status: "PENDING" } }),
  ]);

  const workloadBalance = calculateWorkloadBalance(workloads);
  const teamHealth = calculateTeamHealth(
    access.project.projectHealth,
    workloadBalance,
    pendingEvents,
  );

  return (
    <TeamView
      projectHealth={access.project.projectHealth}
      teamHealth={teamHealth}
      workloadBalance={workloadBalance}
      workloads={workloads}
      activities={activities}
      isTeamMode={access.project.mode === "TEAM"}
    />
  );
}
