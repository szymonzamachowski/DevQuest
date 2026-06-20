import { ProjectMemberRole, ProjectMode, ProjectQuestStatus } from "@prisma/client";

export type QuestMembership = {
  role: ProjectMemberRole;
  userId: string;
};

export function isQuestAssignee(assigneeIds: string[], userId: string): boolean {
  return assigneeIds.includes(userId);
}

export function canAssignQuestMembers(membership: QuestMembership): boolean {
  return membership.role === ProjectMemberRole.LEADER;
}

export function canSubmitQuest(
  membership: QuestMembership,
  assigneeIds: string[],
  status: ProjectQuestStatus,
): boolean {
  if (status !== ProjectQuestStatus.IN_PROGRESS && status !== ProjectQuestStatus.CHANGES_REQUIRED) {
    return false;
  }
  return (
    membership.role === ProjectMemberRole.LEADER || isQuestAssignee(assigneeIds, membership.userId)
  );
}

export function canReviewQuest(
  membership: QuestMembership,
  mode: ProjectMode,
  assigneeIds: string[],
): boolean {
  if (membership.role === ProjectMemberRole.LEADER) return true;
  if (mode === ProjectMode.SOLO && isQuestAssignee(assigneeIds, membership.userId)) {
    return true;
  }
  return false;
}

export function isSoloSelfReview(
  mode: ProjectMode,
  membership: QuestMembership,
  assigneeIds: string[],
): boolean {
  return (
    mode === ProjectMode.SOLO &&
    membership.role === ProjectMemberRole.LEADER &&
    (assigneeIds.length === 0 || isQuestAssignee(assigneeIds, membership.userId))
  );
}
