import { prisma } from "@/lib/db";

export async function getPublicProject(publicSlug: string) {
  const project = await prisma.project.findFirst({
    where: {
      publicSlug,
      isPublic: true,
      status: "COMPLETED",
    },
    include: {
      campaignTemplate: true,
      leader: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              totalXp: true,
              level: true,
            },
          },
        },
      },
      finalReport: {
        include: { userReports: { include: { user: { select: { id: true, name: true } } } } },
      },
      userAchievements: { include: { achievement: true, user: { select: { name: true } } } },
      projectQuests: {
        where: { status: "COMPLETED" },
        include: { questTemplate: { select: { title: true, category: true, isMainQuest: true } } },
      },
    },
  });

  return project;
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userSkills: { include: { skill: true } },
      userAchievements: {
        include: {
          achievement: true,
          project: { select: { title: true, publicSlug: true, isPublic: true } },
        },
        orderBy: { unlockedAt: "desc" },
      },
      projectMembers: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
              isPublic: true,
              publicSlug: true,
              completedAt: true,
              campaignTemplate: { select: { title: true } },
            },
          },
        },
      },
    },
  });
  return user;
}

export async function getProjectReport(projectId: string, userId: string) {
  const access = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: {
      project: {
        include: {
          finalReport: {
            include: {
              userReports: {
                include: { user: { select: { id: true, name: true, email: true } } },
              },
            },
          },
          campaignTemplate: true,
        },
      },
    },
  });
  if (!access) return null;
  return access;
}
