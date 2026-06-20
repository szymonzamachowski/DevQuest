import { ProjectMemberRole, ProjectMode, ProjectQuestStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  canReviewQuest,
  canSubmitQuest,
  isSoloSelfReview,
} from "@/lib/permissions/quest-permissions";

describe("quest permissions", () => {
  const leader = { role: ProjectMemberRole.LEADER, userId: "leader" };
  const member = { role: ProjectMemberRole.MEMBER, userId: "member" };

  it("allows assignees to submit in progress quests", () => {
    expect(canSubmitQuest(member, ["member"], ProjectQuestStatus.IN_PROGRESS)).toBe(true);
    expect(canSubmitQuest(member, [], ProjectQuestStatus.AVAILABLE)).toBe(false);
  });

  it("allows leader review in team mode", () => {
    expect(canReviewQuest(leader, ProjectMode.TEAM, ["member"])).toBe(true);
    expect(canReviewQuest(member, ProjectMode.TEAM, ["member"])).toBe(false);
  });

  it("allows solo self review", () => {
    expect(isSoloSelfReview(ProjectMode.SOLO, leader, ["leader"])).toBe(true);
    expect(isSoloSelfReview(ProjectMode.TEAM, leader, ["leader"])).toBe(false);
  });
});
