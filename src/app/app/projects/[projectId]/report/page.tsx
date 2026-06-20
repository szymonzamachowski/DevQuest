import { notFound } from "next/navigation";

import { CampaignReportView } from "@/features/completion/components/campaign-report-view";
import {
  checkCampaignCompletionEligibility,
  canCompleteCampaign,
} from "@/lib/services/campaign-completion.service";
import type { TeamReportPayload } from "@/lib/services/final-report.service";
import { getProjectReport } from "@/features/completion/queries/completion";
import { requireAuth } from "@/lib/require-auth";

export default async function ProjectReportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requireAuth();
  const access = await getProjectReport(projectId, session.user.id);
  if (!access) notFound();

  const { project, role } = access;
  const eligibility = await checkCampaignCompletionEligibility(projectId);
  const permission = canCompleteCampaign({
    eligibility,
    isLeader: role === "LEADER",
    isSolo: project.mode === "SOLO",
    projectStatus: project.status,
  });

  const report = project.finalReport;
  const payload = (report?.reportPayload ?? null) as TeamReportPayload | null;

  return (
    <CampaignReportView
      projectId={projectId}
      projectStatus={project.status}
      isLeader={role === "LEADER"}
      isSolo={project.mode === "SOLO"}
      eligibility={eligibility}
      canComplete={permission.allowed}
      initial={{
        repositoryUrl: project.repositoryUrl,
        liveDemoUrl: project.liveDemoUrl,
        solutionDescription: project.solutionDescription,
        isPublic: project.isPublic,
        publicSlug: project.publicSlug,
      }}
      report={
        report
          ? {
              finalGrade: report.finalGrade,
              finalHealth: report.finalHealth,
              completionScore: report.completionScore,
              teamworkScore: report.teamworkScore,
              testingScore: report.testingScore,
              documentationScore: report.documentationScore,
              adaptabilityScore: report.adaptabilityScore,
              summary: report.summary,
              reportPayload: payload,
              generatedAt: report.generatedAt,
              userReports: report.userReports.map((ur) => ({
                userId: ur.userId,
                user: ur.user,
                questsCompleted: ur.questsCompleted,
                commitsSubmitted: ur.commitsSubmitted,
                reviewsCompleted: ur.reviewsCompleted,
                contributionSummary: ur.contributionSummary,
                strongestSkills: ur.strongestSkills,
                improvementAreas: ur.improvementAreas,
                finalScore: ur.finalScore,
                skillXpBreakdown: ur.skillXpBreakdown,
                roleContribution: ur.roleContribution,
                suggestedNextDirection: ur.suggestedNextDirection,
              })),
            }
          : null
      }
      currentUserId={session.user.id}
      publicSlug={project.publicSlug}
    />
  );
}
