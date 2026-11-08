"use server";

import { revalidatePath } from "next/cache";

import { CompleteCampaignSchema } from "@/features/completion/schemas";
import { getProjectForMember } from "@/features/quests/queries/project-quests";
import {
  canCompleteCampaign,
  checkCampaignCompletionEligibility,
} from "@/lib/services/campaign-completion.service";
import { completeCampaign } from "@/lib/services/final-report.service";
import { assertCampaignNotAlreadyCompleted, assertProjectMutable } from "@/lib/demo";
import { prisma } from "@/lib/db";
import { getAuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

async function requireUserId() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

export async function getCompletionPreviewAction(projectId: string) {
  const userId = await requireUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  const eligibility = await checkCampaignCompletionEligibility(projectId);
  const permission = canCompleteCampaign({
    eligibility,
    isLeader: access.membership.role === "LEADER",
    isSolo: access.project.mode === "SOLO",
    projectStatus: access.project.status,
  });

  return {
    eligibility,
    permission,
    project: {
      status: access.project.status,
      repositoryUrl: access.project.repositoryUrl,
      liveDemoUrl: access.project.liveDemoUrl,
      solutionDescription: access.project.solutionDescription,
      isPublic: access.project.isPublic,
      publicSlug: access.project.publicSlug,
      finalReport: access.project.finalReport ?? null,
    },
  };
}

export async function completeCampaignAction(projectId: string, formData: FormData) {
  const userId = await requireUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  const eligibility = await checkCampaignCompletionEligibility(projectId);
  const permission = canCompleteCampaign({
    eligibility,
    isLeader: access.membership.role === "LEADER",
    isSolo: access.project.mode === "SOLO",
    projectStatus: access.project.status,
  });

  if (!permission.allowed) {
    return { ok: false as const, error: permission.reason ?? "NOT_ALLOWED" };
  }

  const parsed = CompleteCampaignSchema.safeParse({
    repositoryUrl: formData.get("repositoryUrl") || undefined,
    liveDemoUrl: formData.get("liveDemoUrl") || undefined,
    isPublic: formData.get("isPublic") === "true",
    solutionDescription: formData.get("solutionDescription"),
    publicSlug: formData.get("publicSlug") || undefined,
  });
  if (!parsed.success) return { ok: false as const, error: "VALIDATION_ERROR" };

  // Anonymous demo guests can finish the campaign but not publish pages under our domain.
  const actor = await prisma.user.findUnique({ where: { id: userId }, select: { isGuest: true } });
  const isPublic = parsed.data.isPublic && !actor?.isGuest;

  try {
    await assertProjectMutable(projectId);
    await assertCampaignNotAlreadyCompleted(projectId);
    const report = await completeCampaign(projectId, {
      repositoryUrl: parsed.data.repositoryUrl || undefined,
      liveDemoUrl: parsed.data.liveDemoUrl || undefined,
      isPublic,
      solutionDescription: parsed.data.solutionDescription,
      publicSlug: isPublic ? parsed.data.publicSlug || undefined : undefined,
    });

    revalidatePath(`/app/projects/${projectId}/report`);
    revalidatePath(`/app/projects/${projectId}`);
    if (isPublic && parsed.data.publicSlug) {
      revalidatePath(`/projects/${parsed.data.publicSlug}`);
    }

    return { ok: true as const, reportId: report.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return { ok: false as const, error: message };
  }
}
