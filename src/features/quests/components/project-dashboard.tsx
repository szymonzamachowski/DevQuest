"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";

import { AchievementIcon } from "@/components/ui/achievement-icon";
import { Button } from "@/components/ui/button";
import { PixelMeter, healthTone, rarityText } from "@/components/ui/pixel-meter";
import { levelProgress } from "@/lib/xp-level";
import { cn } from "@/lib/utils";

type DashboardProps = {
  projectId: string;
  campaignTitle: string;
  chapterTitle?: string | null;
  stats: {
    campaignProgress: number;
    chapterProgress: number;
    availableCount: number;
    lockedCount: number;
  };
  health: { score: number; band: { label: string; key: string } };
  healthRisks: string[];
  pendingClientEvents: Array<{ id: string; clientEventTemplate: { subject: string } }>;
  latestClientMessage: {
    id: string;
    clientEventTemplate: { subject: string; message: string };
    status: string;
  } | null;
  latestAchievement: {
    achievement: { title: string; description: string; rarity: string; icon: string };
    unlockedAt: Date;
  } | null;
  workloads: Array<{
    userId: string;
    name: string | null;
    email: string;
    activeQuests: number;
    completedQuests: number;
    teamworkXp: number;
    isBlocked: boolean;
    isInactive: boolean;
  }>;
  workloadBalance: { label: string; spread: number };
  teamHealth: { score: number; label: string };
  mainQuest: { id: string; questTemplate: { title: string } } | null | undefined;
  availableQuests: Array<{ id: string; questTemplate: { title: string } }>;
  lockedQuests: Array<{ id: string; questTemplate: { title: string } }>;
  myAssignments: Array<{ id: string; questTemplate: { title: string }; status: string }>;
  members: Array<{
    user: { id: string; name: string | null; email: string; totalXp: number; level: number };
    teamworkXp: number;
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    user: { name: string | null } | null;
  }>;
  userXp: { totalXp: number; level: number } | null;
};

export function ProjectDashboardView(props: DashboardProps) {
  const t = useTranslations("phase4.dashboard");
  const format = useFormatter();
  const tQuest = useTranslations("quests.dashboard");
  const pending = props.pendingClientEvents.length;
  const xp = props.userXp ? levelProgress(props.userXp.totalXp) : null;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl leading-none text-[var(--dq-parchment)] md:text-6xl">
            {props.campaignTitle}
          </h1>
          {props.chapterTitle ? (
            <p className="text-lg text-[var(--dq-mana)]">
              {tQuest("currentChapter", { chapter: props.chapterTitle })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link href={`/app/projects/${props.projectId}/client-inbox`}>
              {t("openInbox")}
              {pending > 0 ? (
                <span className="ml-1 bg-[var(--dq-blood)] px-1.5 text-[var(--dq-ink)]">
                  {pending}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/app/projects/${props.projectId}/quests`}>{tQuest("openBoard")}</Link>
          </Button>
        </div>
      </header>

      <section
        aria-label={t("partyStatus")}
        className="dq-card grid gap-8 p-6 md:grid-cols-2 xl:grid-cols-4"
      >
        <PixelMeter
          label={t("projectHealth")}
          value={props.health.score}
          display={`${props.health.score}/100`}
          tone={healthTone(props.health.band.key)}
          hint={props.health.band.label}
          className="dq-animate-health"
        />
        <PixelMeter label={tQuest("campaignProgress")} value={props.stats.campaignProgress} />
        <PixelMeter
          label={tQuest("chapterProgress")}
          value={props.stats.chapterProgress}
          tone="mana"
        />
        {props.userXp && xp ? (
          <PixelMeter
            label={t("level", { level: props.userXp.level })}
            value={xp.percent}
            display={`${props.userXp.totalXp} XP`}
            tone="ember"
            hint={t("xpToNext", { xp: xp.xpToNext, level: props.userXp.level + 1 })}
            className="dq-animate-xp"
          />
        ) : null}
      </section>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="dq-card dq-card--quest flex flex-col justify-between gap-6 p-6 lg:col-span-3">
          <div className="space-y-2">
            <h2 className="text-[var(--dq-gold)]">{tQuest("mainQuest")}</h2>
            {props.mainQuest ? (
              <p className="text-3xl leading-tight text-[var(--dq-parchment)]">
                {props.mainQuest.questTemplate.title}
              </p>
            ) : (
              <p className="text-[var(--muted-foreground)]">{tQuest("noMainQuest")}</p>
            )}
          </div>
          {props.mainQuest ? (
            <Button asChild size="lg" className="self-start">
              <Link href={`/app/projects/${props.projectId}/quests/${props.mainQuest.id}`}>
                {t("openQuest")}
              </Link>
            </Button>
          ) : null}
        </section>

        <section className="space-y-3 lg:col-span-2">
          <h2 className="text-[var(--muted-foreground)]">{t("latestClientMessage")}</h2>
          {props.latestClientMessage ? (
            <Link
              href={`/app/projects/${props.projectId}/client-inbox`}
              className="dq-parchment block space-y-2 p-5 transition-transform duration-75 hover:-translate-y-1"
            >
              <div className="text-xl leading-tight">
                {props.latestClientMessage.clientEventTemplate.subject}
              </div>
              <p className="line-clamp-3 text-[#5a4632]">
                {props.latestClientMessage.clientEventTemplate.message}
              </p>
              <div className="pt-1 text-[#7a4a1c] underline decoration-2 underline-offset-4">
                {t("lettersWaiting", { count: pending })}
              </div>
            </Link>
          ) : (
            <p className="dq-card p-5 text-[var(--muted-foreground)]">{t("noClientMessages")}</p>
          )}
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="dq-card space-y-3 p-5">
          <h2 className="text-[var(--dq-ember)]">{t("activeRisks")}</h2>
          {props.healthRisks.length > 0 ? (
            <ul className="space-y-2">
              {props.healthRisks.map((risk) => (
                <li key={risk} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-2 shrink-0 bg-[var(--dq-ember)]" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[var(--muted-foreground)]">{t("noActiveRisks")}</p>
          )}
        </section>

        <section className="dq-card space-y-3 p-5">
          <h2 className="text-[var(--dq-mana)]">{t("teamWorkload")}</h2>
          <div className="text-sm text-[var(--muted-foreground)]">
            {t("teamHealth")}: {props.teamHealth.label} ({props.teamHealth.score})
          </div>
          <ul className="space-y-2">
            {props.workloads.map((w) => (
              <li key={w.userId} className="flex items-baseline justify-between gap-3">
                <span className={cn(w.isInactive && "text-[var(--muted-foreground)]")}>
                  {w.name || w.email}
                  {w.isBlocked ? (
                    <span className="ml-2 text-[var(--dq-blood)]">{t("blocked")}</span>
                  ) : null}
                  {w.isInactive ? (
                    <span className="ml-2 text-[var(--dq-outline)]">{t("inactive")}</span>
                  ) : null}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {t("activeQuests", { count: w.activeQuests })}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="dq-card space-y-3 p-5">
          <h2 className="text-[var(--dq-gold)]">{t("latestAchievement")}</h2>
          {props.latestAchievement ? (
            <div className="flex gap-4">
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center bg-[var(--dq-ink)]",
                  rarityText[props.latestAchievement.achievement.rarity],
                )}
              >
                <AchievementIcon name={props.latestAchievement.achievement.icon} />
              </div>
              <div className="space-y-1">
                <div className="text-lg leading-tight">
                  {props.latestAchievement.achievement.title}
                </div>
                <div className={rarityText[props.latestAchievement.achievement.rarity]}>
                  {t(`rarity.${props.latestAchievement.achievement.rarity}`)}
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {props.latestAchievement.achievement.description}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[var(--muted-foreground)]">{t("noAchievements")}</p>
          )}
        </section>
      </div>

      <section className="dq-card p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-3xl text-[var(--dq-parchment)]">{t("chronicle")}</h2>
          <Link
            href={`/app/projects/${props.projectId}/activity`}
            className="text-[var(--dq-gold)] underline decoration-2 underline-offset-4"
          >
            {t("viewAllActivity")}
          </Link>
        </div>
        <ol className="mt-4">
          {props.activities.slice(0, 6).map((a) => (
            <li
              key={a.id}
              className="grid gap-1 border-b-[3px] border-dashed border-[var(--dq-surface-container-high)] py-3 last:border-0 sm:grid-cols-[1fr_auto] sm:gap-6"
            >
              <div>
                <span>{a.title}</span>
                <span className="ml-2 text-[var(--dq-mana)]">{a.user?.name ?? t("system")}</span>
              </div>
              <time
                dateTime={a.createdAt.toISOString()}
                className="text-sm text-[var(--dq-outline)]"
              >
                {format.dateTime(a.createdAt, "dateTime")}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
