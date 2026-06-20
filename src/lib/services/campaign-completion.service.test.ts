import { describe, expect, it } from "vitest";

import { canCompleteCampaign } from "@/lib/services/campaign-completion.service";
import { CompleteCampaignSchema } from "@/features/completion/schemas";
import { gradeFromScore } from "@/lib/services/final-report.service";
import { DEMO_EMAILS, isDemoEmail } from "@/lib/demo";

describe("canCompleteCampaign", () => {
  const eligible = {
    eligible: true,
    missing: [],
    stats: {
      requiredMainTotal: 10,
      requiredMainCompleted: 10,
      optionalCompleted: 1,
      optionalTotal: 2,
      unresolvedCriticalEvents: 0,
      pendingClientEvents: 0,
    },
  };

  it("blocks when campaign already completed", () => {
    const result = canCompleteCampaign({
      eligibility: eligible,
      isLeader: true,
      isSolo: false,
      projectStatus: "COMPLETED",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("ALREADY_COMPLETED");
  });

  it("requires leader or solo mode", () => {
    const result = canCompleteCampaign({
      eligibility: eligible,
      isLeader: false,
      isSolo: false,
      projectStatus: "ACTIVE",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("LEADER_REQUIRED");
  });

  it("blocks when requirements are missing", () => {
    const result = canCompleteCampaign({
      eligibility: {
        ...eligible,
        eligible: false,
        missing: ["Required main quest not completed: X"],
      },
      isLeader: true,
      isSolo: false,
      projectStatus: "ACTIVE",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("REQUIREMENTS_NOT_MET");
  });

  it("allows leader when eligible", () => {
    const result = canCompleteCampaign({
      eligibility: eligible,
      isLeader: true,
      isSolo: false,
      projectStatus: "ACTIVE",
    });
    expect(result.allowed).toBe(true);
  });

  it("allows solo player when eligible", () => {
    const result = canCompleteCampaign({
      eligibility: eligible,
      isLeader: true,
      isSolo: true,
      projectStatus: "ACTIVE",
    });
    expect(result.allowed).toBe(true);
  });
});

describe("gradeFromScore", () => {
  it("maps composite score to letter grades deterministically", () => {
    expect(gradeFromScore(95)).toBe("A");
    expect(gradeFromScore(85)).toBe("B");
    expect(gradeFromScore(75)).toBe("C");
    expect(gradeFromScore(65)).toBe("D");
    expect(gradeFromScore(40)).toBe("F");
  });
});

describe("CompleteCampaignSchema", () => {
  it("requires public slug when publishing", () => {
    const parsed = CompleteCampaignSchema.safeParse({
      isPublic: true,
      solutionDescription: "A sufficiently long solution description for validation.",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts private completion without slug", () => {
    const parsed = CompleteCampaignSchema.safeParse({
      isPublic: false,
      solutionDescription: "A sufficiently long solution description for validation.",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("demo mode helpers", () => {
  it("recognizes demo emails", () => {
    expect(isDemoEmail(DEMO_EMAILS[0])).toBe(true);
    expect(isDemoEmail("other@example.com")).toBe(false);
  });
});
