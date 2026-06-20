import { ProjectMode, ProjectStatus, SetupStep, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { assessStack } from "@/lib/services/stack-assessment.service";
import {
  evaluateAndUnlockQuests,
  initializeProjectQuests,
} from "@/lib/services/quest-unlock.service";
import {
  evaluateCriticalCoverage,
  parseTeamRoles,
  SOLO_APPROVED_ROLES,
  type TeamRoles,
} from "@/types/team-roles";
import type { TechStack } from "@/types/tech-stack";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function findSetupProjectForUser(campaignTemplateId: string, leaderId: string) {
  return prisma.project.findFirst({
    where: {
      campaignTemplateId,
      leaderId,
      status: ProjectStatus.SETUP,
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      campaignTemplate: {
        include: { chapters: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export async function getProjectWithAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      campaignTemplate: {
        include: { chapters: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!project) return null;

  const membership = project.members.find((m) => m.userId === userId);
  if (!membership) return null;

  return { project, membership };
}

export async function createSetupProject(params: {
  campaignTemplateId: string;
  leaderId: string;
  title: string;
}) {
  const existing = await findSetupProjectForUser(params.campaignTemplateId, params.leaderId);
  if (existing) return existing;

  const suffix = Math.random().toString(36).slice(2, 8);
  const slug = `${slugify(params.title)}-${suffix}`;

  return prisma.project.create({
    data: {
      campaignTemplateId: params.campaignTemplateId,
      title: params.title,
      slug,
      mode: ProjectMode.SOLO,
      status: ProjectStatus.SETUP,
      setupStep: SetupStep.MODE,
      leaderId: params.leaderId,
      members: {
        create: {
          userId: params.leaderId,
          role: "LEADER",
          preferredRoles: [],
          approvedRoles: [],
        },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      campaignTemplate: {
        include: { chapters: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export async function setProjectMode(projectId: string, mode: ProjectMode) {
  const nextStep = mode === ProjectMode.SOLO ? SetupStep.ROLES : SetupStep.TEAM;

  if (mode === ProjectMode.SOLO) {
    return prisma.project.update({
      where: { id: projectId },
      data: {
        mode,
        setupStep: nextStep,
        members: {
          updateMany: {
            where: { role: "LEADER" },
            data: {
              preferredRoles: SOLO_APPROVED_ROLES,
              approvedRoles: SOLO_APPROVED_ROLES,
            },
          },
        },
      },
    });
  }

  return prisma.project.update({
    where: { id: projectId },
    data: { mode, setupStep: nextStep },
  });
}

export async function addProjectMemberByEmail(projectId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true, campaignTemplate: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  if (project.members.length >= project.campaignTemplate.maximumTeamSize) {
    throw new Error("TEAM_FULL");
  }

  if (project.members.some((m) => m.userId === user.id)) {
    throw new Error("ALREADY_MEMBER");
  }

  await prisma.projectMember.create({
    data: {
      projectId,
      userId: user.id,
      role: "MEMBER",
      preferredRoles: [],
      approvedRoles: [],
    },
  });

  return user;
}

export async function setPreferredRoles(projectId: string, userId: string, roles: TeamRoles) {
  return prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { preferredRoles: roles },
  });
}

export async function approveMemberRoles(
  projectId: string,
  targetUserId: string,
  roles: TeamRoles,
) {
  return prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    data: { approvedRoles: roles },
  });
}

export function getTeamCriticalCoverage(members: Array<{ approvedRoles: Prisma.JsonValue }>) {
  const approvedByMember = members.map((m) => parseTeamRoles(m.approvedRoles));
  return evaluateCriticalCoverage(approvedByMember);
}

export async function saveTechStack(projectId: string, stack: TechStack) {
  const assessment = assessStack(stack);
  return prisma.project.update({
    where: { id: projectId },
    data: {
      techStack: stack,
      stackAssessment: assessment,
      setupStep: SetupStep.SUMMARY,
    },
  });
}

export async function completeProjectSetup(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: true,
      campaignTemplate: { include: { chapters: { orderBy: { order: "asc" } } } },
    },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const coverage = getTeamCriticalCoverage(project.members);
  if (!coverage.isComplete) throw new Error("CRITICAL_ROLES_INCOMPLETE");

  const firstChapter = project.campaignTemplate.chapters[0]?.id ?? null;
  const weeks = 3;
  const estimatedEnd = new Date();
  estimatedEnd.setDate(estimatedEnd.getDate() + weeks * 7);

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: ProjectStatus.ACTIVE,
      setupStep: SetupStep.COMPLETED,
      currentChapterId: firstChapter,
      startedAt: new Date(),
      estimatedEndDate: estimatedEnd,
    },
  });

  await initializeProjectQuests(projectId);
  await evaluateAndUnlockQuests(projectId, project.leaderId);

  return updated;
}

export function getNextSetupStep(current: SetupStep, mode: ProjectMode): SetupStep | null {
  const soloFlow: SetupStep[] = [
    SetupStep.MODE,
    SetupStep.ROLES,
    SetupStep.STACK,
    SetupStep.SUMMARY,
    SetupStep.COMPLETED,
  ];
  const teamFlow: SetupStep[] = [
    SetupStep.MODE,
    SetupStep.TEAM,
    SetupStep.ROLES,
    SetupStep.ROLE_APPROVAL,
    SetupStep.STACK,
    SetupStep.SUMMARY,
    SetupStep.COMPLETED,
  ];
  const flow = mode === ProjectMode.SOLO ? soloFlow : teamFlow;
  const idx = flow.indexOf(current);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1]! : null;
}

export async function advanceSetupStep(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  const next = getNextSetupStep(project.setupStep, project.mode);
  if (!next) return project;
  return prisma.project.update({
    where: { id: projectId },
    data: { setupStep: next },
  });
}
