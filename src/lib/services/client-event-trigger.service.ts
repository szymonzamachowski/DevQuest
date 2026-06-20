import type { ClientEventTriggerType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { triggerClientEvent } from "@/lib/services/client-event.service";

type TriggerConfig = {
  questSlug?: string;
  chapterOrder?: number;
  daysSinceStart?: number;
};

export async function evaluateClientEventTriggers(
  projectId: string,
  context: {
    type: "QUEST_COMPLETED" | "CHAPTER_START" | "TIME_CHECK";
    questSlug?: string;
    chapterOrder?: number;
  },
  actorUserId?: string,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { campaignTemplate: { include: { clientEvents: true } } },
  });
  if (!project?.startedAt) return [];

  const triggered: string[] = [];
  const daysSinceStart = Math.floor(
    (Date.now() - project.startedAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  for (const template of project.campaignTemplate.clientEvents) {
    const config = template.triggerConfiguration as TriggerConfig;
    let shouldTrigger = false;

    switch (template.triggerType as ClientEventTriggerType) {
      case "QUEST_COMPLETED":
        shouldTrigger =
          context.type === "QUEST_COMPLETED" &&
          !!context.questSlug &&
          config.questSlug === context.questSlug;
        break;
      case "CHAPTER_START":
        shouldTrigger =
          context.type === "CHAPTER_START" &&
          context.chapterOrder !== undefined &&
          config.chapterOrder === context.chapterOrder;
        break;
      case "TIME_SINCE_START":
        shouldTrigger =
          (context.type === "TIME_CHECK" || context.type === "QUEST_COMPLETED") &&
          config.daysSinceStart !== undefined &&
          daysSinceStart >= config.daysSinceStart;
        break;
      default:
        break;
    }

    if (!shouldTrigger) continue;

    const event = await triggerClientEvent(projectId, template.id, actorUserId);
    if (event) triggered.push(template.title);
  }

  return triggered;
}
