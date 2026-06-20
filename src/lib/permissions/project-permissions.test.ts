import { ProjectMemberRole, ProjectMode } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  canApproveMemberRoles,
  canApproveRoles,
  canInviteMembers,
  canSetPreferredRoles,
  isProjectLeader,
} from "@/lib/permissions/project-permissions";
import { evaluateCriticalCoverage, SOLO_APPROVED_ROLES } from "@/types/team-roles";

describe("project permissions", () => {
  it("identifies leader capabilities", () => {
    const leader = { role: ProjectMemberRole.LEADER };
    const member = { role: ProjectMemberRole.MEMBER, userId: "u2" };

    expect(isProjectLeader(leader)).toBe(true);
    expect(canApproveRoles(leader)).toBe(true);
    expect(canInviteMembers(leader)).toBe(true);
    expect(canApproveRoles(member)).toBe(false);
    expect(canSetPreferredRoles(member, "u2")).toBe(true);
    expect(canSetPreferredRoles(member, "u3")).toBe(false);
  });

  it("blocks leader self-approval in team mode", () => {
    const leader = { role: ProjectMemberRole.LEADER, userId: "leader-1" };
    expect(canApproveMemberRoles(leader, "leader-1", ProjectMode.TEAM)).toBe(false);
    expect(canApproveMemberRoles(leader, "member-1", ProjectMode.TEAM)).toBe(true);
    expect(canApproveMemberRoles(leader, "leader-1", ProjectMode.SOLO)).toBe(true);
  });
});

describe("critical role coverage", () => {
  it("marks solo default roles as complete", () => {
    const coverage = evaluateCriticalCoverage([SOLO_APPROVED_ROLES]);
    expect(coverage.isComplete).toBe(true);
    expect(coverage.engineering).toBe(true);
    expect(coverage.testing).toBe(true);
    expect(coverage.documentation).toBe(true);
  });

  it("detects missing testing responsibility in team", () => {
    const coverage = evaluateCriticalCoverage([["frontend"], ["backend"]]);
    expect(coverage.isComplete).toBe(false);
    expect(coverage.missing).toContain("testing");
    expect(coverage.missing).toContain("documentation");
  });
});
