import { ProjectQuestStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  canTransitionQuestStatus,
  kanbanColumnForStatus,
  statusForKanbanDrop,
} from "@/lib/services/quest-workflow.service";

describe("quest workflow", () => {
  it("maps statuses to kanban columns", () => {
    expect(kanbanColumnForStatus(ProjectQuestStatus.CHANGES_REQUIRED)).toBe("REVIEW");
    expect(kanbanColumnForStatus(ProjectQuestStatus.AVAILABLE)).toBe("AVAILABLE");
  });

  it("allows available to in progress for assignees", () => {
    const result = canTransitionQuestStatus(
      ProjectQuestStatus.AVAILABLE,
      ProjectQuestStatus.IN_PROGRESS,
      { isLeader: false, isAssignee: true, isSoloMode: false },
    );
    expect(result.allowed).toBe(true);
  });

  it("blocks locked manual transitions", () => {
    const result = canTransitionQuestStatus(
      ProjectQuestStatus.LOCKED,
      ProjectQuestStatus.AVAILABLE,
      { isLeader: true, isAssignee: true, isSoloMode: true },
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("QUEST_LOCKED");
  });

  it("requires leader for completion in team mode", () => {
    const result = canTransitionQuestStatus(
      ProjectQuestStatus.REVIEW,
      ProjectQuestStatus.COMPLETED,
      { isLeader: false, isAssignee: true, isSoloMode: false },
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("LEADER_REQUIRED");
  });

  it("allows solo self-review completion", () => {
    const result = canTransitionQuestStatus(
      ProjectQuestStatus.REVIEW,
      ProjectQuestStatus.COMPLETED,
      { isLeader: true, isAssignee: true, isSoloMode: true },
    );
    expect(result.allowed).toBe(true);
  });

  it("prevents dropping into locked column", () => {
    expect(statusForKanbanDrop("LOCKED", ProjectQuestStatus.AVAILABLE)).toBeNull();
  });
});
