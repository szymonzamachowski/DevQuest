import { ActivityType, ProjectStatus } from "@prisma/client";

import { getHealthBand } from "@/config/health-rules";
import { prisma } from "@/lib/db";
import { checkCampaignCompletionEligibility } from "@/lib/services/campaign-completion.service";

export type TeamReportPayload = {
  durationDays: number;
  requiredQuestsCompleted: number;
  requiredQuestsTotal: number;
  optionalQuestsCompleted: number;
  optionalQuestsTotal: number;
  unresolvedItems: string[];
  clientDecisions: Array<{ title: string; decision: string; result: string }>;
  achievements: Array<{ title: string; rarity: string }>;
  strongestAreas: string[];
  recommendations: string[];
};

export function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function buildRecommendations(
  testingScore: number,
  documentationScore: number,
  optionalCompleted: number,
  health: number,
): string[] {
  const recs: string[] = [];
  if (testingScore < 70) {
    recs.push("Practice a campaign with stronger automated testing focus.");
  }
  if (documentationScore < 70) {
    recs.push("Choose a project that emphasizes technical writing and README quality.");
  }
  if (health < 70) {
    recs.push("Prioritize client communication and scope negotiation in the next campaign.");
  }
  if (optionalCompleted < 2) {
    recs.push("Try completing more optional quests to deepen portfolio breadth.");
  }
  if (recs.length === 0) {
    recs.push("Consider an intermediate campaign with integrations and deployment hardening.");
  }
  return recs;
}

type ScoreContext = {
  eligibility: Awaited<ReturnType<typeof checkCampaignCompletionEligibility>>;
  testingCompleted: number;
  testingTotal: number;
  documentationCompleted: number;
  documentationTotal: number;
  avgTeamworkXp: number;
  resolvedClientEvents: number;
  expiredClientEvents: number;
  limitedOrDeferDecisions: number;
};

function computeScores(ctx: ScoreContext, finalHealth: number) {
  const completionScore =
    ctx.eligibility.stats.requiredMainTotal > 0
      ? Math.round(
          (ctx.eligibility.stats.requiredMainCompleted / ctx.eligibility.stats.requiredMainTotal) *
            100,
        )
      : 0;

  const teamworkScore = Math.min(100, Math.round(ctx.avgTeamworkXp / 2));
  const testingScore =
    ctx.testingTotal > 0 ? Math.round((ctx.testingCompleted / ctx.testingTotal) * 100) : 50;
  const documentationScore =
    ctx.documentationTotal > 0
      ? Math.round((ctx.documentationCompleted / ctx.documentationTotal) * 100)
      : 50;

  let adaptabilityScore = 70;
  adaptabilityScore += ctx.limitedOrDeferDecisions * 8;
  adaptabilityScore -= ctx.expiredClientEvents * 15;
  adaptabilityScore += ctx.resolvedClientEvents * 5;
  adaptabilityScore = Math.max(0, Math.min(100, adaptabilityScore));

  const composite = Math.round(
    completionScore * 0.35 +
      finalHealth * 0.2 +
      teamworkScore * 0.15 +
      testingScore * 0.1 +
      documentationScore * 0.1 +
      adaptabilityScore * 0.1,
  );

  return {
    completionScore,
    teamworkScore,
    testingScore,
    documentationScore,
    adaptabilityScore,
    composite,
    finalGrade: gradeFromScore(composite),
  };
}

function buildUserContributionSummary(params: {
  name: string;
  questsCompleted: number;
  reviewsCompleted: number;
  teamworkXp: number;
  roles: string[];
}): string {
  const roleText = params.roles.length > 0 ? params.roles.join(", ") : "general delivery";
  return `${params.name} completed ${params.questsCompleted} quests, performed ${params.reviewsCompleted} reviews, and contributed primarily in ${roleText}. Teamwork XP earned: ${params.teamworkXp}.`;
}

function suggestNextDirection(strongest: string[], preferred: string | null | undefined): string {
  if (preferred) return preferred;
  if (strongest.includes("Testing")) return "Quality engineering and test automation";
  if (strongest.includes("Frontend")) return "Product-facing frontend engineering";
  if (strongest.includes("Backend")) return "API and platform backend development";
  return "Full-stack product delivery";
}

export async function generateFinalReport(projectId: string) {
  const existing = await prisma.finalReport.findUnique({ where: { projectId } });
  if (existing) return existing;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: true } },
      campaignTemplate: true,
      projectQuests: {
        include: {
          questTemplate: { select: { category: true, isRequired: true, title: true } },
        },
      },
      clientEvents: {
        include: {
          clientEventTemplate: { select: { title: true } },
          selectedOption: { select: { label: true, decisionType: true, resultMessage: true } },
        },
      },
      userAchievements: { include: { achievement: true, user: { select: { name: true } } } },
    },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const eligibility = await checkCampaignCompletionEligibility(projectId);

  const testingQuests = project.projectQuests.filter((q) => q.questTemplate.category === "TESTING");
  const documentationQuests = project.projectQuests.filter(
    (q) => q.questTemplate.category === "DOCUMENTATION",
  );

  const avgTeamworkXp =
    project.members.length > 0
      ? project.members.reduce((s, m) => s + m.teamworkXp, 0) / project.members.length
      : 0;

  const resolvedEvents = project.clientEvents.filter((e) => e.status === "RESOLVED");
  const expiredEvents = project.clientEvents.filter((e) => e.status === "EXPIRED");
  const limitedOrDefer = resolvedEvents.filter(
    (e) =>
      e.selectedOption?.decisionType === "LIMITED" || e.selectedOption?.decisionType === "DEFER",
  ).length;

  const scores = computeScores(
    {
      eligibility,
      testingCompleted: testingQuests.filter((q) => q.status === "COMPLETED").length,
      testingTotal: testingQuests.length,
      documentationCompleted: documentationQuests.filter((q) => q.status === "COMPLETED").length,
      documentationTotal: documentationQuests.length,
      avgTeamworkXp,
      resolvedClientEvents: resolvedEvents.length,
      expiredClientEvents: expiredEvents.length,
      limitedOrDeferDecisions: limitedOrDefer,
    },
    project.projectHealth,
  );

  const durationDays =
    project.startedAt && project.completedAt
      ? Math.max(
          1,
          Math.ceil(
            (project.completedAt.getTime() - project.startedAt.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : project.startedAt
        ? Math.max(1, Math.ceil((Date.now() - project.startedAt.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

  const skillTotals = new Map<string, number>();
  for (const member of project.members) {
    const skills = await prisma.userSkill.findMany({
      where: { userId: member.userId },
      include: { skill: true },
    });
    for (const s of skills) {
      skillTotals.set(s.skill.key, (skillTotals.get(s.skill.key) ?? 0) + s.xp);
    }
  }
  const strongestAreas = [...skillTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key]) => key);

  const unresolvedItems = [
    ...eligibility.missing,
    ...project.clientEvents
      .filter((e) => e.status === "PENDING")
      .map((e) => `Pending client message: ${e.clientEventTemplate.title}`),
  ];

  const payload: TeamReportPayload = {
    durationDays,
    requiredQuestsCompleted: eligibility.stats.requiredMainCompleted,
    requiredQuestsTotal: eligibility.stats.requiredMainTotal,
    optionalQuestsCompleted: eligibility.stats.optionalCompleted,
    optionalQuestsTotal: eligibility.stats.optionalTotal,
    unresolvedItems,
    clientDecisions: resolvedEvents.map((e) => ({
      title: e.clientEventTemplate.title,
      decision: e.selectedOption?.label ?? "—",
      result: e.resultMessage ?? e.selectedOption?.resultMessage ?? "",
    })),
    achievements: project.userAchievements.map((ua) => ({
      title: ua.achievement.title,
      rarity: ua.achievement.rarity,
    })),
    strongestAreas,
    recommendations: buildRecommendations(
      scores.testingScore,
      scores.documentationScore,
      eligibility.stats.optionalCompleted,
      project.projectHealth,
    ),
  };

  const band = getHealthBand(project.projectHealth);
  const summary = `Campaign "${project.campaignTemplate.title}" completed with grade ${scores.finalGrade}. Final health: ${project.projectHealth} (${band.label}). ${payload.requiredQuestsCompleted}/${payload.requiredQuestsTotal} required main quests completed in ${durationDays} days.`;

  const report = await prisma.$transaction(async (tx) => {
    const created = await tx.finalReport.create({
      data: {
        projectId,
        finalGrade: scores.finalGrade,
        finalHealth: project.projectHealth,
        completionScore: scores.completionScore,
        teamworkScore: scores.teamworkScore,
        testingScore: scores.testingScore,
        documentationScore: scores.documentationScore,
        adaptabilityScore: scores.adaptabilityScore,
        summary,
        reportPayload: payload,
      },
    });

    for (const member of project.members) {
      const userId = member.userId;
      const questsCompleted = await tx.questAssignment.count({
        where: { userId, projectQuest: { projectId, status: "COMPLETED" } },
      });
      const commitsSubmitted = await tx.questSubmission.count({
        where: { submittedById: userId, projectQuest: { projectId } },
      });
      const reviewsCompleted = await tx.questSubmission.count({
        where: { reviewedById: userId, projectQuest: { projectId }, status: "ACCEPTED" },
      });

      const userSkills = await tx.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });
      const skillXpBreakdown = Object.fromEntries(userSkills.map((s) => [s.skill.key, s.xp]));
      const sortedSkills = [...userSkills].sort((a, b) => b.xp - a.xp);
      const strongestSkills = sortedSkills.slice(0, 3).map((s) => s.skill.key);
      const improvementAreas = sortedSkills.slice(-2).map((s) => s.skill.key);

      const roles = Array.isArray(member.approvedRoles) ? (member.approvedRoles as string[]) : [];

      const userScore = Math.min(
        100,
        Math.round(
          questsCompleted * 8 +
            commitsSubmitted * 4 +
            reviewsCompleted * 6 +
            member.teamworkXp * 0.2,
        ),
      );

      await tx.userFinalReport.create({
        data: {
          finalReportId: created.id,
          userId,
          questsCompleted,
          commitsSubmitted,
          reviewsCompleted,
          contributionSummary: buildUserContributionSummary({
            name: member.user.name ?? member.user.email,
            questsCompleted,
            reviewsCompleted,
            teamworkXp: member.teamworkXp,
            roles,
          }),
          strongestSkills,
          improvementAreas,
          finalScore: userScore,
          skillXpBreakdown,
          roleContribution: roles,
          suggestedNextDirection: suggestNextDirection(
            strongestSkills,
            member.user.preferredDirection,
          ),
        },
      });
    }

    await tx.projectActivity.create({
      data: {
        projectId,
        type: ActivityType.PROJECT_COMPLETED,
        title: "Campaign completed",
        description: summary,
        metadata: { finalGrade: scores.finalGrade, reportId: created.id },
      },
    });

    return created;
  });

  return report;
}

export async function completeCampaign(
  projectId: string,
  input: {
    repositoryUrl?: string;
    liveDemoUrl?: string;
    isPublic: boolean;
    solutionDescription: string;
    publicSlug?: string;
  },
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  if (project.status === ProjectStatus.COMPLETED) {
    throw new Error("CAMPAIGN_ALREADY_COMPLETED");
  }

  const slug =
    input.isPublic && input.publicSlug
      ? input.publicSlug
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 64)
      : null;

  if (slug) {
    const taken = await prisma.project.findFirst({
      where: { publicSlug: slug, id: { not: projectId } },
    });
    if (taken) throw new Error("PUBLIC_SLUG_TAKEN");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: ProjectStatus.COMPLETED,
      completedAt: new Date(),
      repositoryUrl: input.repositoryUrl ?? project.repositoryUrl,
      liveDemoUrl: input.liveDemoUrl ?? project.liveDemoUrl,
      solutionDescription: input.solutionDescription,
      isPublic: input.isPublic,
      publicSlug: input.isPublic ? slug : null,
    },
  });

  return generateFinalReport(projectId);
}
