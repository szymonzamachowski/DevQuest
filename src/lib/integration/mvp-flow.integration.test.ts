import { describe, expect, it } from "vitest";

import { CompleteCampaignSchema } from "@/features/completion/schemas";
import { RegisterSchema } from "@/features/auth/schemas";
import { canCompleteCampaign } from "@/lib/services/campaign-completion.service";
import { gradeFromScore } from "@/lib/services/final-report.service";

describe("integration: campaign completion flow rules", () => {
  const eligible = {
    eligible: true,
    missing: [],
    stats: {
      requiredMainTotal: 8,
      requiredMainCompleted: 8,
      optionalCompleted: 1,
      optionalTotal: 2,
      unresolvedCriticalEvents: 0,
      pendingClientEvents: 0,
    },
  };

  it("chains leader permission with completion schema", () => {
    const permission = canCompleteCampaign({
      eligibility: eligible,
      isLeader: true,
      isSolo: false,
      projectStatus: "ACTIVE",
    });
    expect(permission.allowed).toBe(true);

    const parsed = CompleteCampaignSchema.safeParse({
      isPublic: true,
      publicSlug: "brightlane-booking",
      solutionDescription:
        "A complete booking platform with validated scheduling flows and deployment docs.",
    });
    expect(parsed.success).toBe(true);
  });

  it("produces deterministic grade for report generation", () => {
    expect(gradeFromScore(88)).toBe("B");
  });
});

describe("integration: auth registration validation", () => {
  it("rejects weak passwords before persistence", () => {
    const parsed = RegisterSchema.safeParse({
      email: "user@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(parsed.success).toBe(false);
  });
});
