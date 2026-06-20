import { z } from "zod";

export const CompleteCampaignSchema = z
  .object({
    repositoryUrl: z.string().url().optional().or(z.literal("")),
    liveDemoUrl: z.string().url().optional().or(z.literal("")),
    isPublic: z.boolean(),
    solutionDescription: z.string().trim().min(20).max(4000),
    publicSlug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/)
      .min(3)
      .max(64)
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.isPublic && !data.publicSlug) {
      ctx.addIssue({ code: "custom", message: "Public slug is required", path: ["publicSlug"] });
    }
  });
