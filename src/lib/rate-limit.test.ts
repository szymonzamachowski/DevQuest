import { describe, expect, it } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
  });

  it("blocks requests above the limit", () => {
    const key = `block-${Date.now()}`;
    checkRateLimit(key, { limit: 2, windowMs: 60_000 });
    checkRateLimit(key, { limit: 2, windowMs: 60_000 });
    const blocked = checkRateLimit(key, { limit: 2, windowMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });
});
