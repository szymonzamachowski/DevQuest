import { z } from "zod";

export const GitHubCommitUrlSchema = z
  .string()
  .url()
  .refine(
    (url) =>
      /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/commit\/[a-fA-F0-9]{7,40}\/?$/.test(
        url.trim(),
      ),
    { message: "INVALID_GITHUB_COMMIT_URL" },
  );

export const GitHubPullRequestUrlSchema = z
  .string()
  .url()
  .optional()
  .refine(
    (url) =>
      !url ||
      /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/pull\/\d+\/?$/.test(
        url.trim(),
      ),
    { message: "INVALID_GITHUB_PR_URL" },
  );

export const QuestSubmissionSchema = z.object({
  commitUrl: GitHubCommitUrlSchema,
  pullRequestUrl: GitHubPullRequestUrlSchema,
  description: z.string().trim().min(10).max(2000),
});

export const QuestReviewSchema = z.object({
  submissionId: z.string().min(1),
  decision: z.enum(["ACCEPTED", "CHANGES_REQUIRED"]),
  reviewComment: z.string().trim().max(2000).optional(),
});

export const QuestCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export const QuestAssignSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(4),
});

export const QuestStatusMoveSchema = z.object({
  status: z.enum(["AVAILABLE", "IN_PROGRESS", "REVIEW", "CHANGES_REQUIRED", "COMPLETED", "FAILED"]),
});
