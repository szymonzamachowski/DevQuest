import { describe, expect, it } from "vitest";

import { calculateTeamworkXp, calculateUserLevel } from "@/lib/services/xp.service";

describe("xp service helpers", () => {
  it("calculates user level from total xp", () => {
    expect(calculateUserLevel(0)).toBe(1);
    expect(calculateUserLevel(499)).toBe(1);
    expect(calculateUserLevel(500)).toBe(2);
  });

  it("derives teamwork xp from base quest xp", () => {
    expect(calculateTeamworkXp(120)).toBe(12);
    expect(calculateTeamworkXp(10)).toBe(5);
  });
});
