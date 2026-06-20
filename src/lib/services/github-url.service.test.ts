import { describe, expect, it } from "vitest";

import {
  parseGitHubCommitUrl,
  parseGitHubPullRequestUrl,
  isValidGitHubCommitUrl,
} from "@/lib/services/github-url.service";

describe("github url parser", () => {
  it("parses commit URLs", () => {
    const ref = parseGitHubCommitUrl(
      "https://github.com/acme/booking-app/commit/abcdef1234567890abcdef1234567890abcdef12",
    );
    expect(ref).toEqual({
      kind: "commit",
      owner: "acme",
      repo: "booking-app",
      sha: "abcdef1234567890abcdef1234567890abcdef12",
      url: "https://github.com/acme/booking-app/commit/abcdef1234567890abcdef1234567890abcdef12",
    });
  });

  it("parses pull request URLs", () => {
    const ref = parseGitHubPullRequestUrl("https://github.com/acme/booking-app/pull/42");
    expect(ref).toEqual({
      kind: "pull_request",
      owner: "acme",
      repo: "booking-app",
      prNumber: 42,
      url: "https://github.com/acme/booking-app/pull/42",
    });
  });

  it("rejects invalid commit URLs", () => {
    expect(isValidGitHubCommitUrl("https://gitlab.com/a/b/commit/abc")).toBe(false);
    expect(parseGitHubCommitUrl("not-a-url")).toBeNull();
  });
});
