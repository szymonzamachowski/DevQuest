import type { ProjectQuestStatus } from "@prisma/client";

/** Text colour per quest status, shared by the board and the quest page. */
export const questStatusTone: Record<ProjectQuestStatus | (string & {}), string> = {
  LOCKED: "text-[var(--dq-outline)]",
  AVAILABLE: "text-[var(--dq-gold)]",
  IN_PROGRESS: "text-[var(--dq-ember)]",
  REVIEW: "text-[var(--dq-mana)]",
  CHANGES_REQUIRED: "text-[var(--dq-blood)]",
  COMPLETED: "text-[var(--dq-moss)]",
  FAILED: "text-[var(--dq-blood)]",
};
