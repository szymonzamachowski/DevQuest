"use server";

import { revalidatePath } from "next/cache";

import { getProjectForMember } from "@/features/quests/queries/project-quests";
import {
  addClientEventComment,
  markClientEventRead,
  resolveClientEventDecision,
} from "@/lib/services/client-event.service";
import { assertProjectMutable } from "@/lib/demo";
import { getAuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { z } from "zod";

const DecisionSchema = z.object({
  optionId: z.string().min(1),
  leaderResponse: z.string().max(2000).optional(),
});

const CommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

async function requireUserId() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

function revalidateInbox(projectId: string) {
  revalidatePath(`/app/projects/${projectId}/client-inbox`);
  revalidatePath(`/app/projects/${projectId}`);
}

export async function resolveClientEventAction(
  projectId: string,
  eventId: string,
  input: { optionId: string; leaderResponse?: string },
) {
  const userId = await requireUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  const parsed = DecisionSchema.safeParse(input);
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  try {
    await assertProjectMutable(projectId);
    const result = await resolveClientEventDecision({
      projectId,
      eventId,
      optionId: parsed.data.optionId,
      leaderResponse: parsed.data.leaderResponse,
      userId,
      isLeader: access.membership.role === "LEADER",
      isSolo: access.project.mode === "SOLO",
    });
    revalidateInbox(projectId);
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return { ok: false as const, error: message };
  }
}

export async function markInboxEventReadAction(projectId: string, eventId: string) {
  const userId = await requireUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  await markClientEventRead(projectId, eventId);
  revalidateInbox(projectId);
  return { ok: true as const };
}

export async function addClientEventCommentAction(
  projectId: string,
  eventId: string,
  content: string,
) {
  const userId = await requireUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  const parsed = CommentSchema.safeParse({ content });
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  await addClientEventComment(projectId, eventId, userId, parsed.data.content);
  revalidateInbox(projectId);
  return { ok: true as const };
}
