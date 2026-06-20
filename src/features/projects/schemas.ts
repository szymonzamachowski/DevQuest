import { z } from "zod";

import { TEAM_ROLE_KEYS, type TeamRoleKey } from "@/types/team-roles";
import { TechStackSchema } from "@/types/tech-stack";

const teamRoleSchema = z.enum(TEAM_ROLE_KEYS as unknown as [TeamRoleKey, ...TeamRoleKey[]]);

export const ProjectModeSchema = z.enum(["SOLO", "TEAM"]);

export const PreferredRolesSchema = z.object({
  roles: z.array(teamRoleSchema).min(1, "Select at least one role"),
});

export const ApproveRolesSchema = z.object({
  targetUserId: z.string().min(1),
  roles: z.array(teamRoleSchema).min(1),
});

export const InviteMemberSchema = z.object({
  email: z.string().email(),
});

export const TechStackFormSchema = TechStackSchema.refine(
  (s) => Object.values(s).some((v) => v && v !== "None"),
  { message: "Select at least one stack component" },
);

export const StartCampaignSchema = z.object({
  campaignTemplateId: z.string().min(1),
});
