"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ProjectQuestStatus } from "@prisma/client";
import { Clock, GitCommit, GripVertical, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type QuestCardData = {
  id: string;
  status: ProjectQuestStatus;
  suggestedDeadline: Date | null;
  questTemplate: {
    title: string;
    category: string;
    questType: string;
    isMainQuest: boolean;
    difficulty: number;
    baseXp: number;
    estimatedMinutes: number;
    dependencies: Array<{ dependsOnQuestTemplate: { title: string } }>;
  };
  assignments: Array<{ user: { id: string; name: string | null; email: string } }>;
  submissions: Array<{ commitUrl: string; status: string }>;
};

function initials(name: string | null, email: string) {
  return (name || email).slice(0, 2).toUpperCase();
}

const STATUS_LABELS: Partial<Record<ProjectQuestStatus, string>> = {
  LOCKED: "Locked",
  AVAILABLE: "Available",
  IN_PROGRESS: "In progress",
  REVIEW: "In review",
  CHANGES_REQUIRED: "Changes required",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export function QuestCard({
  quest,
  projectId,
  isDragging,
  dragHandleProps,
}: {
  quest: QuestCardData;
  projectId: string;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const t = useTranslations("quests");
  const statusLabel = STATUS_LABELS[quest.status] ?? quest.status;

  return (
    <article
      className={cn(
        "dq-card rounded-xl border border-[var(--dq-border)] p-4 transition-shadow",
        "hover:border-[var(--dq-primary)]/40 hover:shadow-[0_0_24px_rgba(173,198,255,0.08)]",
        isDragging && "opacity-60 ring-2 ring-[var(--dq-primary)]",
        quest.status === "COMPLETED" && "dq-animate-complete",
      )}
    >
      <div className="flex items-start gap-2">
        {dragHandleProps ? (
          <button
            type="button"
            className="dq-touch-target -ml-1 flex shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--dq-surface-container-high)] hover:text-[var(--foreground)]"
            aria-label={t("dragHandle")}
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              <Link
                href={`/app/projects/${projectId}/quests/${quest.id}`}
                className="hover:text-[var(--dq-primary)] focus-visible:underline"
              >
                {quest.questTemplate.title}
              </Link>
            </h3>
            <span className="rounded-full bg-[var(--dq-surface-container-high)] px-2 py-0.5 text-[10px] tracking-wide text-[var(--dq-tertiary)] uppercase">
              {quest.questTemplate.isMainQuest ? t("mainQuest") : t("sideQuest")}
            </span>
          </div>

          <p className="sr-only">{t("statusLabel", { status: statusLabel })}</p>

          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[var(--muted-foreground)]">
            <span className="rounded bg-[var(--dq-surface-container-high)] px-2 py-0.5">
              {t(`category.${quest.questTemplate.category}`)}
            </span>
            <span aria-hidden>{t("difficulty", { level: quest.questTemplate.difficulty })}</span>
            <span className="dq-animate-xp" aria-hidden>
              {quest.questTemplate.baseXp} XP
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {Math.round(quest.questTemplate.estimatedMinutes / 60)}h
            </span>
            {quest.submissions[0] ? (
              <span className="inline-flex items-center gap-1 text-[var(--dq-primary)]">
                <GitCommit className="h-3.5 w-3.5" aria-hidden />
                {t("commitLinked")}
              </span>
            ) : null}
          </div>

          {quest.questTemplate.dependencies.length > 0 ? (
            <div className="mt-2 text-[11px] text-[var(--muted-foreground)]">
              {t("dependsOn", {
                names: quest.questTemplate.dependencies
                  .map((d) => d.dependsOnQuestTemplate.title)
                  .join(", "),
              })}
            </div>
          ) : null}

          {quest.suggestedDeadline ? (
            <div className="mt-2 text-[11px] text-[var(--dq-tertiary)]">
              {t("deadline", { date: quest.suggestedDeadline.toLocaleDateString() })}
            </div>
          ) : null}

          {quest.assignments.length > 0 ? (
            <div className="mt-3 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-[var(--muted-foreground)]" aria-hidden />
              {quest.assignments.map((a) => (
                <Avatar key={a.user.id} className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {initials(a.user.name, a.user.email)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
