import { ProjectMemberRole, ProjectMode, type Project, type ProjectMember } from "@prisma/client";

export type ProjectAccess = {
  project: Project;
  membership: ProjectMember;
};

export function isProjectLeader(membership: Pick<ProjectMember, "role">): boolean {
  return membership.role === ProjectMemberRole.LEADER;
}

export function canApproveRoles(membership: Pick<ProjectMember, "role">): boolean {
  return isProjectLeader(membership);
}

export function canApproveMemberRoles(
  membership: Pick<ProjectMember, "role" | "userId">,
  targetUserId: string,
  mode: ProjectMode,
): boolean {
  if (!canApproveRoles(membership)) return false;
  if (mode === ProjectMode.TEAM && membership.userId === targetUserId) return false;
  return true;
}

export function canInviteMembers(membership: Pick<ProjectMember, "role">): boolean {
  return isProjectLeader(membership);
}

export function canRemoveMembers(membership: Pick<ProjectMember, "role">): boolean {
  return isProjectLeader(membership);
}

export function canSetPreferredRoles(
  membership: Pick<ProjectMember, "role" | "userId">,
  targetUserId: string,
): boolean {
  return membership.userId === targetUserId;
}

export function canLaunchCampaign(membership: Pick<ProjectMember, "role">): boolean {
  return isProjectLeader(membership);
}

export function assertProjectLeader(membership: Pick<ProjectMember, "role">): void {
  if (!isProjectLeader(membership)) {
    throw new Error("PERMISSION_DENIED");
  }
}

export function assertProjectMember(
  membership: ProjectMember | null | undefined,
): asserts membership is ProjectMember {
  if (!membership) {
    throw new Error("PERMISSION_DENIED");
  }
}
