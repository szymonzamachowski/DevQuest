import { prisma } from "@/lib/db";

/** Seeded mid-campaign project that every demo sandbox is cloned from. */
export const DEMO_TEMPLATE_PROJECT_ID = "demo-team-active-project";

/**
 * On the public deployment the template must stay pristine, otherwise one visitor
 * logging in with the shared demo account would change every future sandbox.
 */
export function isTemplateLocked(projectId: string): boolean {
  return projectId === DEMO_TEMPLATE_PROJECT_ID && process.env.DEMO_TEMPLATE_LOCKED === "true";
}

export const DEMO_EMAILS = [
  "demo.leader@devquest.local",
  "demo.member@devquest.local",
  "demo.solo@devquest.local",
] as const;

export function isDemoEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (DEMO_EMAILS as readonly string[]).includes(email.toLowerCase());
}

export async function isDemoProject(projectId: string): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { isDemo: true },
  });
  return project?.isDemo ?? false;
}

export class DemoReadOnlyError extends Error {
  constructor() {
    super("DEMO_READ_ONLY");
    this.name = "DemoReadOnlyError";
  }
}

/** Completed demo projects (and the locked template) are read-only. */
export async function assertProjectMutable(projectId: string): Promise<void> {
  if (isTemplateLocked(projectId)) throw new DemoReadOnlyError();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { isDemo: true, status: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  if (project.isDemo && project.status === "COMPLETED") {
    throw new DemoReadOnlyError();
  }
}

export async function assertCampaignNotAlreadyCompleted(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true, finalReport: { select: { id: true } } },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  if (project.status === "COMPLETED" || project.finalReport) {
    throw new Error("CAMPAIGN_ALREADY_COMPLETED");
  }
}
