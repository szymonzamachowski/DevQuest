import { describe, expect, it } from "vitest";

import { clampHealth, getHealthBand, HEALTH_RULE_DELTAS } from "@/config/health-rules";

describe("project health rules", () => {
  it("clamps health between 0 and 100", () => {
    expect(clampHealth(120)).toBe(100);
    expect(clampHealth(-5)).toBe(0);
  });

  it("maps score to deterministic bands", () => {
    expect(getHealthBand(90).key).toBe("EXCELLENT");
    expect(getHealthBand(75).key).toBe("STABLE");
    expect(getHealthBand(60).key).toBe("AT_RISK");
    expect(getHealthBand(30).key).toBe("CRITICAL");
    expect(getHealthBand(10).key).toBe("FAILED");
  });

  it("uses fixed deltas for known rules", () => {
    expect(HEALTH_RULE_DELTAS.REJECTED_SUBMISSION).toBe(-5);
    expect(HEALTH_RULE_DELTAS.QUALITY_QUEST_COMPLETED).toBe(4);
    expect(HEALTH_RULE_DELTAS.EXPIRED_CLIENT_EVENT).toBe(-6);
  });
});
