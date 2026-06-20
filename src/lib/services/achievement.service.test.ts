import { describe, expect, it } from "vitest";

import { calculateTeamworkXp, calculateUserLevel } from "@/lib/services/xp.service";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/services/achievement.service";

describe("achievement definitions", () => {
  it("includes required campaign achievements", () => {
    const keys = ACHIEVEMENT_DEFINITIONS.map((a) => a.key);
    expect(keys).toContain("first_deployment");
    expect(keys).toContain("scope_negotiator");
    expect(keys).toContain("release_survivor");
    expect(keys.length).toBeGreaterThanOrEqual(8);
  });
});

describe("achievement xp side effects", () => {
  it("teamwork xp derives from base xp deterministically", () => {
    expect(calculateTeamworkXp(100)).toBe(10);
    expect(calculateUserLevel(1000)).toBe(3);
  });
});
