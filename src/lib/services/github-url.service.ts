export type GitHubCommitRef = {
  kind: "commit";
  owner: string;
  repo: string;
  sha: string;
  url: string;
};

export type GitHubPullRequestRef = {
  kind: "pull_request";
  owner: string;
  repo: string;
  prNumber: number;
  url: string;
};

export type GitHubRef = GitHubCommitRef | GitHubPullRequestRef;

const COMMIT_URL =
  /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/commit\/([a-fA-F0-9]{7,40})\/?$/;
const PR_URL =
  /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/pull\/(\d+)\/?$/;

export function isValidGitHubCommitUrl(url: string): boolean {
  return COMMIT_URL.test(url.trim());
}

export function isValidGitHubPullRequestUrl(url: string): boolean {
  return PR_URL.test(url.trim());
}

export function parseGitHubCommitUrl(url: string): GitHubCommitRef | null {
  const match = url.trim().match(COMMIT_URL);
  if (!match) return null;
  const [, owner, repo, sha] = match;
  return { kind: "commit", owner: owner!, repo: repo!, sha: sha!, url: url.trim() };
}

export function parseGitHubPullRequestUrl(url: string): GitHubPullRequestRef | null {
  const match = url.trim().match(PR_URL);
  if (!match) return null;
  const [, owner, repo, prNumber] = match;
  return {
    kind: "pull_request",
    owner: owner!,
    repo: repo!,
    prNumber: Number(prNumber),
    url: url.trim(),
  };
}

export function parseGitHubUrl(url: string): GitHubRef | null {
  return parseGitHubCommitUrl(url) ?? parseGitHubPullRequestUrl(url);
}

export type GitHubMetadata = {
  title?: string;
  message?: string;
  author?: string;
  fetchedAt: string;
  source: "github_api" | "unavailable";
};

export async function fetchGitHubMetadata(ref: GitHubRef): Promise<GitHubMetadata> {
  const fetchedAt = new Date().toISOString();
  try {
    const apiUrl =
      ref.kind === "commit"
        ? `https://api.github.com/repos/${ref.owner}/${ref.repo}/commits/${ref.sha}`
        : `https://api.github.com/repos/${ref.owner}/${ref.repo}/pulls/${ref.prNumber}`;

    const response = await fetch(apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return { fetchedAt, source: "unavailable" };
    }

    const data = (await response.json()) as Record<string, unknown>;
    if (ref.kind === "commit") {
      const commit = data.commit as { message?: string; author?: { name?: string } } | undefined;
      return {
        title: typeof commit?.message === "string" ? commit.message.split("\n")[0] : undefined,
        message: typeof commit?.message === "string" ? commit.message : undefined,
        author: commit?.author?.name,
        fetchedAt,
        source: "github_api",
      };
    }

    return {
      title: typeof data.title === "string" ? data.title : undefined,
      message: typeof data.body === "string" ? data.body : undefined,
      author:
        typeof data.user === "object" && data.user && "login" in data.user
          ? String((data.user as { login?: string }).login)
          : undefined,
      fetchedAt,
      source: "github_api",
    };
  } catch {
    return { fetchedAt, source: "unavailable" };
  }
}
