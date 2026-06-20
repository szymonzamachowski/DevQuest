import { describe, expect, it } from "vitest";

import {
  calculateTeamHealth,
  calculateWorkloadBalance,
  type MemberWorkload,
} from "@/lib/services/team-workload.service";

const baseMember = (overrides: Partial<MemberWorkload>): MemberWorkload => ({
  userId: "u1",
  name: "User",
  email: "u@example.com",
  activeQuests: 0,
  completedQuests: 0,
  contributionScore: 0,
  teamworkXp: 0,
  isBlocked: false,
  isInactive: false,
  ...overrides,
});

describe("workload balance", () => {
  it("marks even distribution as balanced", () => {
    const result = calculateWorkloadBalance([
      baseMember({ userId: "u1", activeQuests: 1 }),
      baseMember({ userId: "u2", activeQuests: 1 }),
    ]);
    expect(result.label).toBe("balanced");
    expect(result.spread).toBe(0);
  });

  it("marks wide spread as critical", () => {
    const result = calculateWorkloadBalance([
      baseMember({ userId: "u1", activeQuests: 4 }),
      baseMember({ userId: "u2", activeQuests: 0 }),
    ]);
    expect(result.label).toBe("critical");
    expect(result.spread).toBeGreaterThanOrEqual(3);
  });
});

describe("team health", () => {
  it("reduces score for pending events and uneven workload", () => {
    const balanced = calculateTeamHealth(85, { score: 90, label: "balanced", spread: 0 }, 0);
    const stressed = calculateTeamHealth(85, { score: 40, label: "critical", spread: 4 }, 2);
    expect(stressed.score).toBeLessThan(balanced.score);
  });
});
