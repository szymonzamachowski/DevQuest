"use server";

import { ProjectMode, ProjectMemberRole } from "@prisma/client";
import { redirect } from "next/navigation";

import {
  addProjectMemberByEmail,
  approveMemberRoles,
  completeProjectSetup,
  createSetupProject,
  findSetupProjectForUser,
  getProjectWithAccess,
  saveTechStack,
  setPreferredRoles,
  setProjectMode,
  advanceSetupStep,
} from "@/lib/services/project-setup.service";
import { getCampaignById } from "@/features/campaigns/queries/campaigns";
import {
  ApproveRolesSchema,
  InviteMemberSchema,
  PreferredRolesSchema,
  ProjectModeSchema,
  TechStackFormSchema,
} from "@/features/projects/schemas";
import {
  assertProjectLeader,
  assertProjectMember,
  canApproveMemberRoles,
  canSetPreferredRoles,
} from "@/lib/permissions/project-permissions";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import type { TeamRoles } from "@/types/team-roles";
import { parseTeamRoles } from "@/types/team-roles";

async function requireSessionUserId(): Promise<string> {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

export async function ensureSetupProjectAction(campaignTemplateId: string) {
  const userId = await requireSessionUserId();
  const campaign = await getCampaignById(campaignTemplateId);
  if (!campaign) throw new Error("CAMPAIGN_NOT_FOUND");

  const project =
    (await findSetupProjectForUser(campaignTemplateId, userId)) ??
    (await createSetupProject({
      campaignTemplateId,
      leaderId: userId,
      title: campaign.title,
    }));

  return { projectId: project.id, setupStep: project.setupStep, mode: project.mode };
}

export async function selectModeAction(projectId: string, mode: "SOLO" | "TEAM") {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");
  assertProjectLeader(access.membership);

  const parsed = ProjectModeSchema.safeParse(mode);
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  const campaign = access.project.campaignTemplate;
  if (parsed.data === "SOLO" && !campaign.supportsSolo) {
    throw new Error("SOLO_NOT_SUPPORTED");
  }

  await setProjectMode(projectId, parsed.data as ProjectMode);
  return { ok: true as const };
}

export async function inviteMemberAction(projectId: string, formData: FormData) {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");
  assertProjectLeader(access.membership);

  const parsed = InviteMemberSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  try {
    const user = await addProjectMemberByEmail(projectId, parsed.data.email);
    return { ok: true as const, user: { id: user.id, name: user.name, email: user.email } };
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return { ok: false as const, error: message };
  }
}

export async function setPreferredRolesAction(projectId: string, roles: TeamRoles) {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");
  assertProjectMember(access.membership);

  if (!canSetPreferredRoles(access.membership, userId)) {
    throw new Error("PERMISSION_DENIED");
  }

  const parsed = PreferredRolesSchema.safeParse({ roles });
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  await setPreferredRoles(projectId, userId, parsed.data.roles);
  return { ok: true as const };
}

export async function approveRolesAction(
  projectId: string,
  targetUserId: string,
  roles: TeamRoles,
) {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");
  assertProjectMember(access.membership);

  if (!canApproveMemberRoles(access.membership, targetUserId, access.project.mode)) {
    if (targetUserId === userId && access.project.mode === ProjectMode.TEAM) {
      throw new Error("CANNOT_SELF_APPROVE");
    }
    throw new Error("PERMISSION_DENIED");
  }

  const parsed = ApproveRolesSchema.safeParse({ targetUserId, roles });
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  await approveMemberRoles(projectId, parsed.data.targetUserId, parsed.data.roles);
  return { ok: true as const };
}

export async function saveStackAction(projectId: string, stack: Record<string, string>) {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");
  assertProjectLeader(access.membership);

  const parsed = TechStackFormSchema.safeParse(stack);
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  const project = await saveTechStack(projectId, parsed.data);
  return { ok: true as const, assessment: project.stackAssessment };
}

export async function launchCampaignAction(projectId: string) {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");
  assertProjectLeader(access.membership);

  try {
    await completeProjectSetup(projectId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return { ok: false as const, error: message };
  }

  redirect(`/app/projects/${projectId}`);
}

export async function continueTeamStepAction(projectId: string) {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");
  assertProjectLeader(access.membership);

  await advanceSetupStep(projectId);
  return { ok: true as const };
}

export async function continueRolesStepAction(projectId: string) {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  if (access.project.mode === ProjectMode.SOLO) {
    if (access.membership.role === ProjectMemberRole.LEADER) {
      await advanceSetupStep(projectId);
    }
    return { ok: true as const };
  }

  if (access.membership.role !== ProjectMemberRole.LEADER) {
    return { ok: true as const, waiting: true as const };
  }

  const allHaveRoles = access.project.members.every(
    (m) => parseTeamRoles(m.preferredRoles).length > 0,
  );
  if (!allHaveRoles) {
    return { ok: false as const, error: "ROLES_PENDING" as const };
  }

  await advanceSetupStep(projectId);
  return { ok: true as const };
}

export async function continueRoleApprovalAction(projectId: string) {
  const userId = await requireSessionUserId();
  const access = await getProjectWithAccess(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");
  assertProjectLeader(access.membership);

  await advanceSetupStep(projectId);
  return { ok: true as const };
}
