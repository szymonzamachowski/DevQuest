import { notFound, redirect } from "next/navigation";

import { SetupWizard } from "@/features/projects/components/setup-wizard";
import { ensureSetupProjectAction } from "@/features/projects/actions/setup.actions";
import { getCampaignById } from "@/features/campaigns/queries/campaigns";
import {
  getProjectWithAccess,
  getTeamCriticalCoverage,
} from "@/lib/services/project-setup.service";
import { requireAuth } from "@/lib/require-auth";
import { parseTeamRoles } from "@/types/team-roles";
import type { StackAssessmentResult } from "@/lib/services/stack-assessment.service";
import type { TechStack } from "@/types/tech-stack";

export const dynamic = "force-dynamic";

type Params = Promise<{ campaignId: string }>;

export default async function CampaignSetupPage({ params }: { params: Params }) {
  const session = await requireAuth();
  const { campaignId } = await params;

  const campaign = await getCampaignById(campaignId);
  if (!campaign) notFound();

  let projectId: string;
  try {
    const result = await ensureSetupProjectAction(campaignId);
    projectId = result.projectId;
  } catch {
    redirect("/login");
  }

  const access = await getProjectWithAccess(projectId, session.user.id);
  if (!access) {
    return (
      <div className="dq-card rounded-xl p-8 text-center">
        <p className="text-sm text-[var(--dq-error)]">Permission denied</p>
      </div>
    );
  }

  if (access.project.status === "ACTIVE" && access.project.setupStep === "COMPLETED") {
    redirect("/app");
  }

  const members = access.project.members.map((m) => ({
    userId: m.userId,
    role: m.role,
    name: m.user.name,
    email: m.user.email,
    preferredRoles: parseTeamRoles(m.preferredRoles),
    approvedRoles: parseTeamRoles(m.approvedRoles),
  }));

  const criticalCoverage = getTeamCriticalCoverage(access.project.members);

  return (
    <SetupWizard
      projectId={access.project.id}
      campaignTitle={campaign.title}
      setupStep={access.project.setupStep}
      mode={access.project.mode}
      supportsSolo={campaign.supportsSolo}
      maxTeamSize={campaign.maximumTeamSize}
      members={members}
      isLeader={access.membership.role === "LEADER"}
      currentUserId={session.user.id}
      techStack={(access.project.techStack as TechStack | null) ?? null}
      stackAssessment={(access.project.stackAssessment as StackAssessmentResult | null) ?? null}
      criticalCoverage={criticalCoverage}
    />
  );
}
