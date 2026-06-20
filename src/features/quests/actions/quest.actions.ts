"use server";

import {
  ActivityType,
  ProjectMemberRole,
  ProjectQuestStatus,
  QuestSubmissionStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import {
  fetchGitHubMetadata,
  parseGitHubCommitUrl,
  parseGitHubPullRequestUrl,
} from "@/lib/services/github-url.service";
import {
  canAssignQuestMembers,
  canReviewQuest,
  canSubmitQuest,
} from "@/lib/permissions/quest-permissions";
import {
  canTransitionQuestStatus,
  statusForKanbanDrop,
  type KanbanColumn,
} from "@/lib/services/quest-workflow.service";
import { evaluateAndUnlockQuests } from "@/lib/services/quest-unlock.service";
import { evaluateAchievements } from "@/lib/services/achievement.service";
import {
  onQuestChangesRequested,
  onQuestCompleted,
  onQuestStarted,
} from "@/lib/services/project-effects.service";
import { awardQuestXp } from "@/lib/services/xp.service";
import { getProjectForMember } from "@/features/quests/queries/project-quests";
import {
  QuestAssignSchema,
  QuestCommentSchema,
  QuestReviewSchema,
  QuestSubmissionSchema,
} from "@/features/quests/schemas";
import { assertProjectMutable } from "@/lib/demo";
import { getAuthOptions } from "@/lib/auth";
import { requireProjectQuest } from "@/lib/permissions/project-quest-access";
import { getServerSession } from "next-auth";

async function requireSessionUserId(): Promise<string> {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

function revalidateProject(projectId: string) {
  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/projects/${projectId}/quests`);
  revalidatePath(`/app/projects/${projectId}/roadmap`);
}

export async function moveQuestStatusAction(
  projectId: string,
  questId: string,
  targetColumn: KanbanColumn,
) {
  const userId = await requireSessionUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  await assertProjectMutable(projectId);

  const quest = await prisma.projectQuest.findFirst({
    where: { id: questId, projectId },
    include: {
      assignments: true,
      questTemplate: { include: { chapterTemplate: true } },
    },
  });
  if (!quest) throw new Error("QUEST_NOT_FOUND");

  const targetStatus = statusForKanbanDrop(targetColumn, quest.status);
  if (!targetStatus) throw new Error("INVALID_TRANSITION");

  const assigneeIds = quest.assignments.map((a) => a.userId);
  const transition = canTransitionQuestStatus(quest.status, targetStatus, {
    isLeader: access.membership.role === ProjectMemberRole.LEADER,
    isAssignee: assigneeIds.includes(userId),
    isSoloMode: access.project.mode === "SOLO",
  });
  if (!transition.allowed) {
    return { ok: false as const, error: transition.reason ?? "INVALID_TRANSITION" };
  }

  const now = new Date();
  await prisma.projectQuest.update({
    where: { id: questId },
    data: {
      status: targetStatus,
      startedAt:
        targetStatus === ProjectQuestStatus.IN_PROGRESS && !quest.startedAt ? now : quest.startedAt,
      submittedAt: targetStatus === ProjectQuestStatus.REVIEW ? now : quest.submittedAt,
      completedAt: targetStatus === ProjectQuestStatus.COMPLETED ? now : quest.completedAt,
    },
  });

  if (targetStatus === ProjectQuestStatus.IN_PROGRESS) {
    await onQuestStarted(projectId, quest.questTemplate.title, userId, questId);
  }

  revalidateProject(projectId);
  return { ok: true as const };
}

export async function moveQuestToColumnAction(
  projectId: string,
  questId: string,
  targetColumn: KanbanColumn,
) {
  return moveQuestStatusAction(projectId, questId, targetColumn);
}

export async function assignQuestMembersAction(
  projectId: string,
  questId: string,
  userIds: string[],
) {
  const userId = await requireSessionUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  if (!canAssignQuestMembers(access.membership)) {
    throw new Error("PERMISSION_DENIED");
  }

  const parsed = QuestAssignSchema.safeParse({ userIds });
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  const memberIds = new Set(access.project.members.map((m) => m.userId));
  if (!parsed.data.userIds.every((id) => memberIds.has(id))) {
    throw new Error("INVALID_ASSIGNEE");
  }

  await assertProjectMutable(projectId);
  await requireProjectQuest(projectId, questId);

  await prisma.$transaction(async (tx) => {
    await tx.questAssignment.deleteMany({ where: { projectQuestId: questId } });
    await tx.questAssignment.createMany({
      data: parsed.data.userIds.map((assigneeId) => ({
        projectQuestId: questId,
        userId: assigneeId,
      })),
    });

    await tx.projectActivity.create({
      data: {
        projectId,
        userId,
        type: ActivityType.QUEST_ASSIGNED,
        title: "Quest assignment updated",
        description: `Assigned ${parsed.data.userIds.length} member(s) to the quest.`,
        metadata: { projectQuestId: questId, userIds: parsed.data.userIds },
      },
    });
  });

  revalidateProject(projectId);
  return { ok: true as const };
}

export async function submitQuestAction(projectId: string, questId: string, formData: FormData) {
  const userId = await requireSessionUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  const quest = await prisma.projectQuest.findFirst({
    where: { id: questId, projectId },
    include: { assignments: true, questTemplate: true },
  });
  if (!quest) throw new Error("QUEST_NOT_FOUND");

  const assigneeIds = quest.assignments.map((a) => a.userId);
  if (!canSubmitQuest(access.membership, assigneeIds, quest.status)) {
    throw new Error("PERMISSION_DENIED");
  }

  await assertProjectMutable(projectId);

  const parsed = QuestSubmissionSchema.safeParse({
    commitUrl: formData.get("commitUrl"),
    pullRequestUrl: formData.get("pullRequestUrl") || undefined,
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "VALIDATION_ERROR" };
  }

  const commitRef = parseGitHubCommitUrl(parsed.data.commitUrl);
  if (!commitRef) return { ok: false as const, error: "INVALID_GITHUB_COMMIT_URL" };

  let prRef = null;
  if (parsed.data.pullRequestUrl) {
    prRef = parseGitHubPullRequestUrl(parsed.data.pullRequestUrl);
    if (!prRef) return { ok: false as const, error: "INVALID_GITHUB_PR_URL" };
  }

  const metadata = await fetchGitHubMetadata(commitRef);

  await prisma.$transaction(async (tx) => {
    await tx.questSubmission.create({
      data: {
        projectQuestId: questId,
        submittedById: userId,
        commitUrl: parsed.data.commitUrl,
        pullRequestUrl: parsed.data.pullRequestUrl ?? null,
        description: parsed.data.description,
        githubMetadata: {
          commit: commitRef,
          pullRequest: prRef,
          metadata,
        },
        status: QuestSubmissionStatus.SUBMITTED,
      },
    });

    await tx.projectQuest.update({
      where: { id: questId },
      data: {
        status: ProjectQuestStatus.REVIEW,
        submittedAt: new Date(),
      },
    });

    await tx.projectActivity.create({
      data: {
        projectId,
        userId,
        type: ActivityType.QUEST_SUBMITTED,
        title: `Submission: ${quest.questTemplate.title}`,
        description: parsed.data.description.slice(0, 180),
        metadata: { projectQuestId: questId, commitUrl: parsed.data.commitUrl },
      },
    });
  });

  revalidateProject(projectId);
  revalidatePath(`/app/projects/${projectId}/quests/${questId}`);
  return { ok: true as const };
}

export async function reviewQuestSubmissionAction(
  projectId: string,
  questId: string,
  input: {
    submissionId: string;
    decision: "ACCEPTED" | "CHANGES_REQUIRED";
    reviewComment?: string;
  },
) {
  const userId = await requireSessionUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  const quest = await prisma.projectQuest.findFirst({
    where: { id: questId, projectId },
    include: {
      assignments: true,
      questTemplate: { include: { chapterTemplate: true } },
    },
  });
  if (!quest) throw new Error("QUEST_NOT_FOUND");

  const assigneeIds = quest.assignments.map((a) => a.userId);
  if (!canReviewQuest(access.membership, access.project.mode, assigneeIds)) {
    throw new Error("PERMISSION_DENIED");
  }

  await assertProjectMutable(projectId);

  const parsed = QuestReviewSchema.safeParse(input);
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  const submission = await prisma.questSubmission.findFirst({
    where: { id: parsed.data.submissionId, projectQuestId: questId },
  });
  if (!submission) throw new Error("SUBMISSION_NOT_FOUND");

  const now = new Date();

  if (parsed.data.decision === "ACCEPTED") {
    await prisma.$transaction(async (tx) => {
      await tx.questSubmission.update({
        where: { id: submission.id },
        data: {
          status: QuestSubmissionStatus.ACCEPTED,
          reviewedById: userId,
          reviewComment: parsed.data.reviewComment ?? null,
          reviewedAt: now,
        },
      });

      await tx.projectQuest.update({
        where: { id: questId },
        data: {
          status: ProjectQuestStatus.COMPLETED,
          completedAt: now,
        },
      });

      await tx.projectActivity.create({
        data: {
          projectId,
          userId,
          type: ActivityType.QUEST_REVIEWED,
          title: `Quest accepted: ${quest.questTemplate.title}`,
          description: parsed.data.reviewComment ?? "Submission accepted.",
          metadata: { projectQuestId: questId, submissionId: submission.id, decision: "ACCEPTED" },
        },
      });
    });

    try {
      await awardQuestXp(questId, userId);
    } catch (e) {
      if (!(e instanceof Error && e.message === "XP_ALREADY_AWARDED")) throw e;
    }

    await evaluateAndUnlockQuests(projectId, userId);

    await onQuestCompleted(projectId, {
      questId,
      questSlug: quest.questTemplate.slug,
      questTitle: quest.questTemplate.title,
      category: quest.questTemplate.category,
      chapterOrder: quest.questTemplate.chapterTemplate.order,
      userId,
    });

    await evaluateAchievements(projectId, userId, {
      type: "QUEST_REVIEWED",
      projectHealth: access.project.projectHealth,
    });
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.questSubmission.update({
        where: { id: submission.id },
        data: {
          status: QuestSubmissionStatus.CHANGES_REQUIRED,
          reviewedById: userId,
          reviewComment: parsed.data.reviewComment ?? null,
          reviewedAt: now,
        },
      });

      await tx.projectQuest.update({
        where: { id: questId },
        data: { status: ProjectQuestStatus.CHANGES_REQUIRED },
      });

      await tx.projectActivity.create({
        data: {
          projectId,
          userId,
          type: ActivityType.QUEST_REVIEWED,
          title: `Changes requested: ${quest.questTemplate.title}`,
          description: parsed.data.reviewComment ?? "Please address the review feedback.",
          metadata: {
            projectQuestId: questId,
            submissionId: submission.id,
            decision: "CHANGES_REQUIRED",
          },
        },
      });
    });

    await onQuestChangesRequested(projectId, quest.questTemplate.title, userId);
  }

  revalidateProject(projectId);
  revalidatePath(`/app/projects/${projectId}/quests/${questId}`);
  return { ok: true as const };
}

export async function addQuestCommentAction(projectId: string, questId: string, content: string) {
  const userId = await requireSessionUserId();
  const access = await getProjectForMember(projectId, userId);
  if (!access) throw new Error("PERMISSION_DENIED");

  const parsed = QuestCommentSchema.safeParse({ content });
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  await assertProjectMutable(projectId);
  await requireProjectQuest(projectId, questId);

  await prisma.questComment.create({
    data: {
      projectQuestId: questId,
      authorId: userId,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/app/projects/${projectId}/quests/${questId}`);
  return { ok: true as const };
}

export async function startQuestAction(projectId: string, questId: string) {
  return moveQuestStatusAction(projectId, questId, "IN_PROGRESS");
}
