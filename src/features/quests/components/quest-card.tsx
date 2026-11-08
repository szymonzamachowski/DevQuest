"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import type { ProjectQuestStatus } from "@prisma/client";
import { Check, Clock, GitCommit, GripVertical, Lock, Users } from "lucide-react";

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
  const format = useFormatter();
  const statusLabel = t(`status.${quest.status}`);

  const locked = quest.status === "LOCKED";
  const done = quest.status === "COMPLETED";

  // Finished quests are trophies, not work: show them as one compact row.
  if (done && !isDragging) {
    return (
      <article className="relative flex items-center gap-2 bg-[var(--dq-surface-container-low)] px-3 py-2">
        <Check className="size-4 shrink-0 text-[var(--dq-moss)]" aria-hidden />
        <Link
          href={`/app/projects/${projectId}/quests/${quest.id}`}
          className="min-w-0 flex-1 truncate text-[var(--muted-foreground)] hover:text-[var(--dq-parchment)]"
        >
          {quest.questTemplate.title}
        </Link>
        <span className="shrink-0 text-sm text-[var(--dq-ember)]">
          +{quest.questTemplate.baseXp}
        </span>
        <span className="sr-only">{t("statusLabel", { status: statusLabel })}</span>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "dq-card relative p-4",
        quest.questTemplate.isMainQuest && !locked && "dq-card--quest",
        locked && "opacity-60 saturate-50",
        isDragging && "rotate-2",
        done && "dq-animate-complete",
      )}
    >
      <div className="flex items-start gap-2">
        {dragHandleProps ? (
          <button
            type="button"
            className="dq-touch-target -my-2 -ml-2 flex shrink-0 cursor-grab items-center justify-center text-[var(--dq-outline)] hover:text-[var(--dq-parchment)] active:cursor-grabbing"
            aria-label={t("dragHandle")}
            {...dragHandleProps}
          >
            <GripVertical className="h-5 w-5" aria-hidden />
          </button>
        ) : null}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <div
              className={cn(
                "text-sm",
                quest.questTemplate.isMainQuest
                  ? "text-[var(--dq-gold)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              {quest.questTemplate.isMainQuest ? t("mainQuest") : t("sideQuest")}
            </div>
            <h3 className="text-lg leading-tight text-[var(--dq-parchment)]">
              <Link
                href={`/app/projects/${projectId}/quests/${quest.id}`}
                className="hover:text-[var(--dq-gold)] focus-visible:underline"
              >
                {locked ? <Lock className="mr-1.5 inline size-4 align-[-2px]" aria-hidden /> : null}
                {done ? (
                  <Check
                    className="mr-1.5 inline size-4 align-[-2px] text-[var(--dq-moss)]"
                    aria-hidden
                  />
                ) : null}
                {quest.questTemplate.title}
              </Link>
            </h3>
          </div>

          <p className="sr-only">{t("statusLabel", { status: statusLabel })}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="bg-[var(--dq-ink)] px-2 text-[var(--muted-foreground)]">
              {t(`category.${quest.questTemplate.category}`)}
            </span>
            <span
              className="flex gap-0.5"
              title={t("difficulty", { level: quest.questTemplate.difficulty })}
            >
              <span className="sr-only">
                {t("difficulty", { level: quest.questTemplate.difficulty })}
              </span>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  aria-hidden
                  className={cn(
                    "size-2",
                    n <= quest.questTemplate.difficulty
                      ? "bg-[var(--dq-ember)]"
                      : "bg-[var(--dq-surface-container-highest)]",
                  )}
                />
              ))}
            </span>
            <span className="text-[var(--dq-ember)]">+{quest.questTemplate.baseXp} XP</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden />
              {Math.round(quest.questTemplate.estimatedMinutes / 60)}h
            </span>
            {quest.submissions[0] ? (
              <span className="inline-flex items-center gap-1 text-[var(--dq-mana)]">
                <GitCommit className="h-4 w-4" aria-hidden />
                {t("commitLinked")}
              </span>
            ) : null}
          </div>

          {locked && quest.questTemplate.dependencies.length > 0 ? (
            <div className="text-sm text-[var(--dq-outline)]">
              {t("dependsOn", {
                names: quest.questTemplate.dependencies
                  .map((d) => d.dependsOnQuestTemplate.title)
                  .join(", "),
              })}
            </div>
          ) : null}

          {quest.suggestedDeadline ? (
            <div className="text-sm text-[var(--dq-ember)]">
              {t("deadline", { date: format.dateTime(quest.suggestedDeadline, "date") })}
            </div>
          ) : null}

          {quest.assignments.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden />
              {quest.assignments.map((a) => (
                <Avatar key={a.user.id} className="h-7 w-7">
                  <AvatarFallback className="bg-[var(--dq-mana)] text-xs text-[var(--dq-ink)]">
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
