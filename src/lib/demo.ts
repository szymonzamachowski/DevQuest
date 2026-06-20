import { prisma } from "@/lib/db";

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

/** Completed demo projects are read-only to prevent permanent data corruption. */
export async function assertProjectMutable(projectId: string): Promise<void> {
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
