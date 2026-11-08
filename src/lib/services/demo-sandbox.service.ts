import { randomBytes, randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { DEMO_TEMPLATE_PROJECT_ID } from "@/lib/demo";

/** How long a guest sandbox lives before the cleanup job removes it. */
export const GUEST_TTL_MS = 24 * 60 * 60 * 1000;

const GUEST_EMAIL_DOMAIN = "guest.devquest.local";

/**
 * Moves every timestamp by the same offset so the copy looks like it happened
 * recently: deadlines stay in the future and the activity log stays in order.
 */
export function makeTimeShift(latestTemplateEvent: Date, now: Date) {
  const offset = now.getTime() - latestTemplateEvent.getTime();
  return <T extends Date | null>(date: T): T =>
    (date === null ? null : new Date(date.getTime() + offset)) as T;
}

/**
 * Creates a guest leader and a guest teammate and gives them a private copy of
 * the seeded mid-campaign project. Everything is created in one transaction, so
 * a failure never leaves half a sandbox behind.
 */
export async function createDemoSandbox(now = new Date()) {
  const template = await prisma.project.findUnique({
    where: { id: DEMO_TEMPLATE_PROJECT_ID },
    include: {
      members: { include: { user: { include: { userSkills: true } } } },
      projectQuests: { include: { assignments: true, submissions: true, comments: true } },
      clientEvents: { include: { comments: true } },
      activities: true,
      healthHistory: true,
      userAchievements: true,
    },
  });
  if (!template) throw new Error("DEMO_TEMPLATE_MISSING");

  const templateLeader = template.members.find((m) => m.role === "LEADER");
  const templateMate = template.members.find((m) => m.role !== "LEADER");
  if (!templateLeader) throw new Error("DEMO_TEMPLATE_MISSING");

  const latest = template.activities.reduce(
    (max, a) => (a.createdAt > max ? a.createdAt : max),
    template.startedAt ?? template.createdAt,
  );
  const shift = makeTimeShift(latest, now);
  const suffix = randomBytes(6).toString("hex");
  const expiresAt = new Date(now.getTime() + GUEST_TTL_MS);

  const guestId = randomUUID();
  const mateId = randomUUID();
  const projectId = randomUUID();
  const userMap = new Map<string, string>([[templateLeader.userId, guestId]]);
  if (templateMate) userMap.set(templateMate.userId, mateId);
  const mapUser = (id: string) => userMap.get(id) ?? guestId;
  const mapOptionalUser = (id: string | null) => (id ? (userMap.get(id) ?? null) : null);

  const questIdMap = new Map(template.projectQuests.map((q) => [q.id, randomUUID()]));
  const eventIdMap = new Map(template.clientEvents.map((e) => [e.id, randomUUID()]));
  const json = (value: Prisma.JsonValue | null) =>
    value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);

  await prisma.$transaction(
    async (tx) => {
      const guestUser = (id: string, name: string, source: typeof templateLeader) => ({
        id,
        name,
        email: `${name.split(" ")[0].toLowerCase()}-${suffix}@${GUEST_EMAIL_DOMAIN}`,
        isGuest: true,
        guestExpiresAt: expiresAt,
        totalXp: source.user.totalXp,
        level: source.user.level,
      });
      await tx.user.createMany({
        data: [
          guestUser(guestId, "Guest Leader", templateLeader),
          ...(templateMate ? [guestUser(mateId, "Mira Teammate", templateMate)] : []),
        ],
      });
      await tx.userSkill.createMany({
        data: template.members.flatMap((m) =>
          m.user.userSkills.map((s) => ({
            userId: mapUser(m.userId),
            skillId: s.skillId,
            xp: s.xp,
          })),
        ),
      });

      await tx.project.create({
        data: {
          id: projectId,
          campaignTemplateId: template.campaignTemplateId,
          title: template.title,
          slug: `sandbox-${suffix}`,
          mode: template.mode,
          status: template.status,
          leaderId: guestId,
          currentChapterId: template.currentChapterId,
          projectHealth: template.projectHealth,
          teamLevel: template.teamLevel,
          estimatedEndDate: shift(template.estimatedEndDate),
          startedAt: shift(template.startedAt),
          isDemo: true,
          isPublic: false,
          screenshots: json(template.screenshots),
          techStack: json(template.techStack),
          stackAssessment: json(template.stackAssessment),
          setupStep: template.setupStep,
        },
      });

      await tx.projectMember.createMany({
        data: template.members.map((m) => ({
          projectId,
          userId: mapUser(m.userId),
          role: m.role,
          preferredRoles: json(m.preferredRoles),
          approvedRoles: json(m.approvedRoles),
          contributionScore: m.contributionScore,
          teamworkXp: m.teamworkXp,
          joinedAt: shift(m.joinedAt),
        })),
      });

      await tx.projectQuest.createMany({
        data: template.projectQuests.map((q) => ({
          id: questIdMap.get(q.id)!,
          projectId,
          questTemplateId: q.questTemplateId,
          status: q.status,
          unlockedAt: shift(q.unlockedAt),
          startedAt: shift(q.startedAt),
          submittedAt: shift(q.submittedAt),
          completedAt: shift(q.completedAt),
          suggestedDeadline: shift(q.suggestedDeadline),
          xpAwardedAt: shift(q.xpAwardedAt),
          healthImpact: q.healthImpact,
        })),
      });

      const quests = template.projectQuests;
      await tx.questAssignment.createMany({
        data: quests.flatMap((q) =>
          q.assignments.map((a) => ({
            projectQuestId: questIdMap.get(q.id)!,
            userId: mapUser(a.userId),
            assignedAt: shift(a.assignedAt),
          })),
        ),
      });
      await tx.questSubmission.createMany({
        data: quests.flatMap((q) =>
          q.submissions.map((s) => ({
            projectQuestId: questIdMap.get(q.id)!,
            submittedById: mapUser(s.submittedById),
            commitUrl: s.commitUrl,
            pullRequestUrl: s.pullRequestUrl,
            description: s.description,
            githubMetadata: json(s.githubMetadata),
            status: s.status,
            reviewedById: mapOptionalUser(s.reviewedById),
            reviewComment: s.reviewComment,
            createdAt: shift(s.createdAt),
            reviewedAt: shift(s.reviewedAt),
          })),
        ),
      });
      await tx.questComment.createMany({
        data: quests.flatMap((q) =>
          q.comments.map((c) => ({
            projectQuestId: questIdMap.get(q.id)!,
            authorId: mapUser(c.authorId),
            content: c.content,
            createdAt: shift(c.createdAt),
          })),
        ),
      });

      await tx.projectClientEvent.createMany({
        data: template.clientEvents.map((e) => ({
          id: eventIdMap.get(e.id)!,
          projectId,
          clientEventTemplateId: e.clientEventTemplateId,
          status: e.status,
          importance: e.importance,
          isRead: false,
          triggeredAt: shift(e.triggeredAt),
          respondedAt: shift(e.respondedAt),
          responseDeadline: shift(e.responseDeadline),
          selectedOptionId: e.selectedOptionId,
          leaderResponse: e.leaderResponse,
          resultingHealthChange: e.resultingHealthChange,
          resultingXpChange: e.resultingXpChange,
          resultMessage: e.resultMessage,
        })),
      });
      await tx.clientEventComment.createMany({
        data: template.clientEvents.flatMap((e) =>
          e.comments.map((c) => ({
            projectClientEventId: eventIdMap.get(e.id)!,
            authorId: mapUser(c.authorId),
            content: c.content,
            createdAt: shift(c.createdAt),
          })),
        ),
      });

      await tx.projectActivity.createMany({
        data: template.activities.map((a) => ({
          projectId,
          userId: mapOptionalUser(a.userId),
          type: a.type,
          title: a.title,
          description: a.description,
          metadata: json(a.metadata),
          createdAt: shift(a.createdAt),
        })),
      });
      await tx.projectHealthHistory.createMany({
        data: template.healthHistory.map((h) => ({
          projectId,
          userId: mapOptionalUser(h.userId),
          previousValue: h.previousValue,
          newValue: h.newValue,
          delta: h.delta,
          reason: h.reason,
          ruleKey: h.ruleKey,
          createdAt: shift(h.createdAt),
        })),
      });
      await tx.userAchievement.createMany({
        data: template.userAchievements
          .filter((ua) => userMap.has(ua.userId))
          .map((ua) => ({
            userId: mapUser(ua.userId),
            achievementId: ua.achievementId,
            projectId,
            unlockedAt: shift(ua.unlockedAt),
          })),
      });
    },
    { timeout: 30_000, maxWait: 10_000 },
  );

  return { userId: guestId, projectId };
}

/** Deletes expired guests. Their projects go first because Project.leader has no cascade. */
export async function deleteExpiredGuests(now = new Date()) {
  const expired = await prisma.user.findMany({
    where: { isGuest: true, guestExpiresAt: { lt: now } },
    select: { id: true },
  });
  const ids = expired.map((u) => u.id);
  if (ids.length === 0) return { users: 0, projects: 0 };

  const projects = await prisma.project.deleteMany({ where: { leaderId: { in: ids } } });
  const users = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  return { users: users.count, projects: projects.count };
}
