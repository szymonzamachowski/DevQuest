import { prisma } from "@/lib/db";

export async function requireProjectQuest(projectId: string, questId: string) {
  const quest = await prisma.projectQuest.findFirst({
    where: { id: questId, projectId },
    select: { id: true },
  });
  if (!quest) throw new Error("QUEST_NOT_FOUND");
  return quest;
}
