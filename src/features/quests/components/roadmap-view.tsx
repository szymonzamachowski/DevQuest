"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type RoadmapQuest = {
  id: string;
  status: string;
  questTemplate: {
    title: string;
    slug: string;
    isMainQuest: boolean;
    isRequired: boolean;
    order: number;
    chapterTemplate: { id: string; title: string; order: number };
    dependencies: Array<{ dependsOnQuestTemplateId: string }>;
  };
};

export function RoadmapView({
  projectId,
  quests,
  chapters,
}: {
  projectId: string;
  quests: RoadmapQuest[];
  chapters: Array<{ id: string; title: string; order: number; description: string }>;
}) {
  const t = useTranslations("quests.roadmap");

  const byChapter = chapters.map((chapter) => ({
    chapter,
    quests: quests.filter((q) => q.questTemplate.chapterTemplate.id === chapter.id),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("subtitle")}</p>
      </div>

      <div className="hidden space-y-10 lg:block">
        {byChapter.map(({ chapter, quests: chapterQuests }) => (
          <section key={chapter.id} className="dq-card rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold tracking-widest text-[var(--dq-tertiary)]">
                  {t("chapter", { order: chapter.order })}
                </div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">{chapter.title}</h2>
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">{chapter.description}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {chapterQuests.map((quest, index) => (
                <div key={quest.id} className="flex items-center gap-4">
                  <RoadmapNode projectId={projectId} quest={quest} />
                  {index < chapterQuests.length - 1 ? (
                    <div className="h-px w-8 bg-[var(--dq-outline-variant)]" />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="space-y-6 lg:hidden">
        {byChapter.map(({ chapter, quests: chapterQuests }) => (
          <section key={chapter.id} className="dq-card rounded-xl p-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{chapter.title}</h2>
            <ul className="mt-4 space-y-3 border-l border-[var(--dq-outline-variant)] pl-4">
              {chapterQuests.map((quest) => (
                <li key={quest.id}>
                  <Link
                    href={`/app/projects/${projectId}/quests/${quest.id}`}
                    className={cn(
                      "block rounded-lg border border-[var(--dq-border)] p-3",
                      statusColor(quest.status),
                    )}
                  >
                    <div className="text-sm font-medium">{quest.questTemplate.title}</div>
                    <div className="text-[11px] text-[var(--muted-foreground)]">{quest.status}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function RoadmapNode({ projectId, quest }: { projectId: string; quest: RoadmapQuest }) {
  const t = useTranslations("quests");

  return (
    <Link
      href={`/app/projects/${projectId}/quests/${quest.id}`}
      className={cn(
        "block w-44 rounded-xl border p-3 transition-colors hover:border-[var(--dq-primary)]/50",
        statusColor(quest.status),
        !quest.questTemplate.isRequired && "border-dashed",
      )}
    >
      <div className="text-[10px] tracking-wide text-[var(--dq-tertiary)] uppercase">
        {quest.questTemplate.isMainQuest ? t("mainQuest") : t("sideQuest")}
      </div>
      <div className="mt-1 text-sm leading-snug font-medium">{quest.questTemplate.title}</div>
      <div className="mt-2 text-[10px] text-[var(--muted-foreground)]">{quest.status}</div>
    </Link>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-500/40 bg-emerald-500/10";
    case "IN_PROGRESS":
      return "border-[var(--dq-primary)]/40 bg-[var(--dq-primary)]/10";
    case "AVAILABLE":
      return "border-[var(--dq-tertiary)]/40 bg-[var(--dq-tertiary)]/10";
    case "REVIEW":
    case "CHANGES_REQUIRED":
      return "border-amber-500/40 bg-amber-500/10";
    case "FAILED":
      return "border-red-500/40 bg-red-500/10";
    default:
      return "border-[var(--dq-border)] bg-[var(--dq-surface-container-high)]/40 opacity-70";
  }
}
