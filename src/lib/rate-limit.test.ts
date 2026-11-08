import { describe, expect, it } from "vitest";

import { evaluateBucket } from "@/lib/rate-limit";

describe("evaluateBucket", () => {
  const now = new Date("2026-01-01T12:00:00Z");
  const resetAt = new Date("2026-01-01T12:01:00Z");

  it("allows requests up to the limit", () => {
    expect(evaluateBucket(1, resetAt, 3, now).allowed).toBe(true);
    expect(evaluateBucket(3, resetAt, 3, now).allowed).toBe(true);
  });

  it("blocks requests above the limit and reports when the window resets", () => {
    const blocked = evaluateBucket(4, resetAt, 3, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(60_000);
  });
});
