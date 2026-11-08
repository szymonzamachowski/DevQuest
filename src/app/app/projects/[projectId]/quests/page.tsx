import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { QuestBoard } from "@/features/quests/components/quest-board";
import { getProjectQuestBoard } from "@/features/quests/queries/project-quests";
import { requireAuth } from "@/lib/require-auth";

export default async function ProjectQuestsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await requireAuth();
  const t = await getTranslations("quests");
  const data = await getProjectQuestBoard(projectId, session.user.id);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-5xl leading-none text-[var(--dq-parchment)]">{t("boardTitle")}</h1>
        <p className="max-w-[60ch] text-[var(--muted-foreground)]">{t("boardSubtitle")}</p>
      </div>
      <QuestBoard projectId={projectId} quests={data.quests} />
    </div>
  );
}
