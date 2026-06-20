import { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/db";

export function calculateUserLevel(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / 500) + 1);
}

export function calculateTeamworkXp(baseXp: number): number {
  return Math.max(5, Math.round(baseXp * 0.1));
}

export async function awardQuestXp(projectQuestId: string, actorUserId: string) {
  const quest = await prisma.projectQuest.findUnique({
    where: { id: projectQuestId },
    include: {
      assignments: true,
      project: { select: { status: true, members: true } },
      questTemplate: {
        include: { skillRewards: { include: { skill: true } } },
      },
    },
  });

  if (!quest) throw new Error("QUEST_NOT_FOUND");
  if (quest.status !== "COMPLETED") throw new Error("QUEST_NOT_COMPLETED");
  if (quest.xpAwardedAt) throw new Error("XP_ALREADY_AWARDED");

  if (quest.project.status === "COMPLETED") throw new Error("CAMPAIGN_COMPLETED");

  const recipients =
    quest.assignments.length > 0 ? quest.assignments.map((a) => a.userId) : [actorUserId];

  const skillRewards = quest.questTemplate.skillRewards;
  const baseXp = quest.questTemplate.baseXp;
  const teamworkXpEach = calculateTeamworkXp(baseXp);

  await prisma.$transaction(async (tx) => {
    const awardedAt = new Date();

    await tx.projectQuest.update({
      where: { id: projectQuestId },
      data: { xpAwardedAt: awardedAt },
    });

    for (const userId of recipients) {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) continue;

      const totalXpGain = skillRewards.reduce((sum, reward) => sum + reward.xp, 0) || baseXp;
      const newTotalXp = user.totalXp + totalXpGain;

      await tx.user.update({
        where: { id: userId },
        data: {
          totalXp: newTotalXp,
          level: calculateUserLevel(newTotalXp),
        },
      });

      for (const reward of skillRewards) {
        const existing = await tx.userSkill.findUnique({
          where: { userId_skillId: { userId, skillId: reward.skillId } },
        });
        const newSkillXp = (existing?.xp ?? 0) + reward.xp;
        await tx.userSkill.upsert({
          where: { userId_skillId: { userId, skillId: reward.skillId } },
          create: {
            userId,
            skillId: reward.skillId,
            xp: reward.xp,
            level: calculateUserLevel(reward.xp),
          },
          update: {
            xp: newSkillXp,
            level: calculateUserLevel(newSkillXp),
          },
        });
      }

      const member = quest.project.members.find((m) => m.userId === userId);
      if (member) {
        await tx.projectMember.update({
          where: { projectId_userId: { projectId: quest.projectId, userId } },
          data: { teamworkXp: { increment: teamworkXpEach } },
        });
      }

      await tx.projectActivity.create({
        data: {
          projectId: quest.projectId,
          userId,
          type: ActivityType.XP_AWARDED,
          title: `XP awarded: ${quest.questTemplate.title}`,
          description: `Earned ${totalXpGain} XP and ${teamworkXpEach} teamwork XP.`,
          metadata: {
            projectQuestId,
            baseXp,
            skillRewards: skillRewards.map((r) => ({
              skillKey: r.skill.key,
              xp: r.xp,
            })),
            teamworkXp: teamworkXpEach,
          },
        },
      });
    }
  });
}
