import { describe, expect, it } from "vitest";

import { assessStack } from "@/lib/services/stack-assessment.service";

describe("assessStack", () => {
  it("scores a balanced Next.js + Postgres stack highly", () => {
    const result = assessStack({
      frontend: "Next.js",
      backend: "Next.js API Routes",
      database: "PostgreSQL",
      orm: "Prisma",
      authentication: "Auth.js",
      testing: "Playwright",
      deployment: "Vercel",
    });

    expect(result.compatibilityScore).toBeGreaterThanOrEqual(85);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.advisory).toContain("advisory");
  });

  it("flags missing database and testing as risks", () => {
    const result = assessStack({
      frontend: "Next.js",
      database: "None",
      testing: "None",
    });

    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.missingAreas.length).toBeGreaterThan(0);
    expect(result.compatibilityScore).toBeLessThan(70);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("never returns scores outside 0-100", () => {
    const result = assessStack({
      frontend: "Next.js",
      database: "None",
      testing: "None",
      authentication: "None",
      deployment: "None",
    });
    expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    expect(result.compatibilityScore).toBeLessThanOrEqual(100);
  });
});
