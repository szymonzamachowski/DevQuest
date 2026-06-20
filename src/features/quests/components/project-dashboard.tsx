"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
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

function healthColor(key: string) {
  switch (key) {
    case "EXCELLENT":
      return "text-emerald-400";
    case "STABLE":
      return "text-[var(--dq-primary)]";
    case "AT_RISK":
      return "text-amber-400";
    case "CRITICAL":
      return "text-orange-400";
    default:
      return "text-red-400";
  }
}

export function ProjectDashboardView(props: DashboardProps) {
  const t = useTranslations("phase4.dashboard");
  const tQuest = useTranslations("quests.dashboard");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-widest text-[var(--dq-primary)]">
            CAMPAIGN
          </div>
          <h1 className="font-heading text-3xl text-[var(--foreground)]">{props.campaignTitle}</h1>
          {props.chapterTitle ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {tQuest("currentChapter", { chapter: props.chapterTitle })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/app/projects/${props.projectId}/client-inbox`}>{t("openInbox")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/app/projects/${props.projectId}/quests`}>{tQuest("openBoard")}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t("projectHealth")}
          value={`${props.health.score}`}
          sub={props.health.band.label}
          className={cn(healthColor(props.health.band.key), "dq-animate-health")}
        />
        <StatCard label={tQuest("campaignProgress")} value={`${props.stats.campaignProgress}%`} />
        <StatCard label={tQuest("chapterProgress")} value={`${props.stats.chapterProgress}%`} />
        <StatCard label={t("unresolvedEvents")} value={String(props.pendingClientEvents.length)} />
        <StatCard
          label={tQuest("personalXp")}
          value={props.userXp ? `${props.userXp.totalXp} XP` : "—"}
          sub={props.userXp ? `L${props.userXp.level}` : undefined}
          animateXp
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="dq-card rounded-xl p-5">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--dq-primary)]">
            {t("activeRisks")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {props.healthRisks.map((risk) => (
              <li key={risk} className="text-amber-200/90">
                • {risk}
              </li>
            ))}
            {props.healthRisks.length === 0 ? (
              <li className="text-[var(--muted-foreground)]">{t("noActiveRisks")}</li>
            ) : null}
          </ul>
        </section>

        <section className="dq-card rounded-xl p-5">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--dq-primary)]">
            {t("latestClientMessage")}
          </h2>
          {props.latestClientMessage ? (
            <div className="mt-3">
              <div className="font-medium">
                {props.latestClientMessage.clientEventTemplate.subject}
              </div>
              <p className="mt-1 line-clamp-3 text-sm text-[var(--muted-foreground)]">
                {props.latestClientMessage.clientEventTemplate.message}
              </p>
              <Link
                href={`/app/projects/${props.projectId}/client-inbox`}
                className="mt-2 inline-block text-sm text-[var(--dq-primary)] hover:underline"
              >
                {t("viewInbox")}
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("noClientMessages")}</p>
          )}
        </section>

        <section className="dq-card rounded-xl p-5">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--dq-primary)]">
            {t("latestAchievement")}
          </h2>
          {props.latestAchievement ? (
            <div className="mt-3">
              <div className="font-medium">{props.latestAchievement.achievement.title}</div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {props.latestAchievement.achievement.description}
              </p>
              <div className="mt-2 text-xs tracking-wide text-[var(--dq-tertiary)] uppercase">
                {props.latestAchievement.achievement.rarity}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("noAchievements")}</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="dq-card rounded-xl p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--dq-primary)]">
            {tQuest("mainQuest")}
          </h2>
          {props.mainQuest ? (
            <Link
              href={`/app/projects/${props.projectId}/quests/${props.mainQuest.id}`}
              className="mt-3 block text-lg font-medium text-[var(--foreground)] hover:text-[var(--dq-primary)]"
            >
              {props.mainQuest.questTemplate.title}
            </Link>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{tQuest("noMainQuest")}</p>
          )}
        </section>

        <section className="dq-card rounded-xl p-5">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--dq-primary)]">
            {t("teamWorkload")}
          </h2>
          <div className="mt-2 text-xs text-[var(--muted-foreground)]">
            {t("teamHealth")}: {props.teamHealth.label} ({props.teamHealth.score})
          </div>
          <ul className="mt-3 space-y-2">
            {props.workloads.map((w) => (
              <li key={w.userId} className="flex justify-between text-sm">
                <span className={cn(w.isInactive && "text-[var(--muted-foreground)]")}>
                  {w.name || w.email}
                  {w.isBlocked ? " · blocked" : ""}
                  {w.isInactive ? " · inactive" : ""}
                </span>
                <span className="text-[var(--muted-foreground)]">{w.activeQuests} active</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="dq-card rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--dq-primary)]">
            {tQuest("recentActivity")}
          </h2>
          <Link
            href={`/app/projects/${props.projectId}/activity`}
            className="text-sm text-[var(--dq-primary)]"
          >
            {t("viewAllActivity")}
          </Link>
        </div>
        <ul className="mt-3 space-y-3">
          {props.activities.slice(0, 6).map((a) => (
            <li key={a.id} className="border-b border-[var(--dq-border)] pb-2 last:border-0">
              <div className="text-sm text-[var(--foreground)]">{a.title}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {a.user?.name ?? "System"} · {a.createdAt.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  className,
  animateXp,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
  animateXp?: boolean;
}) {
  return (
    <div className="dq-card rounded-xl p-4">
      <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold", animateXp && "dq-animate-xp", className)}>
        {value}
      </div>
      {sub ? <div className="text-xs text-[var(--muted-foreground)]">{sub}</div> : null}
    </div>
  );
}
