import { ProjectQuestStatus } from "@prisma/client";

export const KANBAN_COLUMNS = [
  "LOCKED",
  "AVAILABLE",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
] as const;

export type KanbanColumn = (typeof KANBAN_COLUMNS)[number];

export function kanbanColumnForStatus(status: ProjectQuestStatus): KanbanColumn {
  if (status === ProjectQuestStatus.CHANGES_REQUIRED) return "REVIEW";
  if (status === ProjectQuestStatus.FAILED) return "COMPLETED";
  if (KANBAN_COLUMNS.includes(status as KanbanColumn)) {
    return status as KanbanColumn;
  }
  return "LOCKED";
}

const ALLOWED_TRANSITIONS: Record<ProjectQuestStatus, ProjectQuestStatus[]> = {
  [ProjectQuestStatus.LOCKED]: [],
  [ProjectQuestStatus.AVAILABLE]: [ProjectQuestStatus.IN_PROGRESS],
  [ProjectQuestStatus.IN_PROGRESS]: [ProjectQuestStatus.REVIEW],
  [ProjectQuestStatus.REVIEW]: [
    ProjectQuestStatus.COMPLETED,
    ProjectQuestStatus.CHANGES_REQUIRED,
    ProjectQuestStatus.FAILED,
  ],
  [ProjectQuestStatus.CHANGES_REQUIRED]: [
    ProjectQuestStatus.IN_PROGRESS,
    ProjectQuestStatus.REVIEW,
  ],
  [ProjectQuestStatus.COMPLETED]: [],
  [ProjectQuestStatus.FAILED]: [],
};

export type TransitionContext = {
  isLeader: boolean;
  isAssignee: boolean;
  isSoloMode: boolean;
};

export function canTransitionQuestStatus(
  from: ProjectQuestStatus,
  to: ProjectQuestStatus,
  context: TransitionContext,
): { allowed: boolean; reason?: string } {
  if (from === to) return { allowed: true };

  if (from === ProjectQuestStatus.LOCKED) {
    return { allowed: false, reason: "QUEST_LOCKED" };
  }

  const allowedTargets = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowedTargets.includes(to)) {
    return { allowed: false, reason: "INVALID_TRANSITION" };
  }

  if (to === ProjectQuestStatus.IN_PROGRESS) {
    if (!context.isAssignee && !context.isLeader) {
      return { allowed: false, reason: "NOT_ASSIGNED" };
    }
  }

  if (
    to === ProjectQuestStatus.REVIEW &&
    from === ProjectQuestStatus.IN_PROGRESS &&
    !context.isAssignee &&
    !context.isLeader
  ) {
    return { allowed: false, reason: "NOT_ASSIGNED" };
  }

  if (
    (to === ProjectQuestStatus.COMPLETED ||
      to === ProjectQuestStatus.CHANGES_REQUIRED ||
      to === ProjectQuestStatus.FAILED) &&
    !context.isLeader &&
    !(context.isSoloMode && context.isAssignee)
  ) {
    return { allowed: false, reason: "LEADER_REQUIRED" };
  }

  return { allowed: true };
}

export function statusForKanbanDrop(
  targetColumn: KanbanColumn,
  currentStatus: ProjectQuestStatus,
): ProjectQuestStatus | null {
  if (targetColumn === "LOCKED") return null;
  if (targetColumn === "REVIEW" && currentStatus === ProjectQuestStatus.CHANGES_REQUIRED) {
    return ProjectQuestStatus.CHANGES_REQUIRED;
  }
  return targetColumn as ProjectQuestStatus;
}
