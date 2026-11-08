import { describe, expect, it } from "vitest";

import { createGuestToken, verifyGuestToken } from "@/lib/guest-token";

const secret = "test-secret-with-enough-length-for-hmac";

describe("guest token", () => {
  it("round-trips a valid token", () => {
    const token = createGuestToken("user_1", secret, 60_000, 1_000);
    expect(verifyGuestToken(token, secret, 2_000)).toBe("user_1");
  });

  it("rejects an expired token", () => {
    const token = createGuestToken("user_1", secret, 60_000, 1_000);
    expect(verifyGuestToken(token, secret, 70_000)).toBeNull();
  });

  it("rejects a token signed with another secret or edited", () => {
    const token = createGuestToken("user_1", secret, 60_000, 1_000);
    expect(verifyGuestToken(token, "another-secret-value-of-similar-len", 2_000)).toBeNull();
    expect(verifyGuestToken(token.replace("user_1", "user_2"), secret, 2_000)).toBeNull();
    expect(verifyGuestToken("garbage", secret, 2_000)).toBeNull();
  });
});
