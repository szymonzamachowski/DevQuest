"use client";

import { useFormatter, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type Workload = {
  userId: string;
  name: string | null;
  email: string;
  activeQuests: number;
  completedQuests: number;
  contributionScore: number;
  teamworkXp: number;
  isBlocked: boolean;
  isInactive: boolean;
};

export function TeamView({
  projectHealth,
  teamHealth,
  workloadBalance,
  workloads,
  activities,
  isTeamMode,
}: {
  projectHealth: number;
  teamHealth: { score: number; label: string };
  workloadBalance: { label: string; spread: number; score: number };
  workloads: Workload[];
  activities: Array<{
    id: string;
    title: string;
    createdAt: Date;
    user: { name: string | null } | null;
  }>;
  isTeamMode: boolean;
}) {
  const t = useTranslations("phase4.team");
  const format = useFormatter();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl leading-none text-[var(--dq-parchment)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="dq-card p-4">
          <div className="text-xs text-[var(--muted-foreground)]">{t("projectHealth")}</div>
          <div className="mt-1 text-2xl font-semibold">{projectHealth}</div>
        </div>
        <div className="dq-card p-4">
          <div className="text-xs text-[var(--muted-foreground)]">{t("teamHealth")}</div>
          <div className="mt-1 text-2xl font-semibold">{teamHealth.label}</div>
          <div className="text-xs text-[var(--muted-foreground)]">{teamHealth.score}/100</div>
        </div>
        <div className="dq-card p-4">
          <div className="text-xs text-[var(--muted-foreground)]">{t("workloadBalance")}</div>
          <div className="mt-1 text-2xl font-semibold capitalize">{workloadBalance.label}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {t("spread", { count: workloadBalance.spread })}
          </div>
        </div>
      </div>

      <section className="dq-card p-5">
        <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("members")}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-[var(--muted-foreground)]">
              <tr>
                <th className="pr-4 pb-3">{t("member")}</th>
                <th className="pr-4 pb-3">{t("activeQuests")}</th>
                <th className="pr-4 pb-3">{t("completedQuests")}</th>
                <th className="pr-4 pb-3">{t("contribution")}</th>
                <th className="pr-4 pb-3">{t("teamworkXp")}</th>
                <th className="pb-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {workloads.map((w) => (
                <tr key={w.userId} className="border-t border-[var(--dq-border)]">
                  <td className="py-3 pr-4">{w.name || w.email}</td>
                  <td className="py-3 pr-4">{w.activeQuests}</td>
                  <td className="py-3 pr-4">{w.completedQuests}</td>
                  <td className="py-3 pr-4">{w.contributionScore}</td>
                  <td className="py-3 pr-4">{w.teamworkXp}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {w.isBlocked ? <Badge label={t("blocked")} tone="warning" /> : null}
                      {w.isInactive ? <Badge label={t("inactive")} tone="muted" /> : null}
                      {!w.isBlocked && !w.isInactive ? (
                        <Badge label={t("active")} tone="ok" />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isTeamMode ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{t("soloModeNote")}</p>
        ) : null}
      </section>

      <section className="dq-card p-5">
        <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("recentActivity")}</h2>
        <ul className="mt-3 space-y-2">
          {activities.map((a) => (
            <li key={a.id} className="text-sm text-[var(--muted-foreground)]">
              {a.title} · {a.user?.name ?? "System"} · {format.dateTime(a.createdAt, "dateTime")}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: "ok" | "warning" | "muted" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-sm",
        tone === "ok" && "bg-[var(--dq-surface-container-lowest)] text-[var(--dq-moss)]",
        tone === "warning" && "bg-[var(--dq-surface-container-lowest)] text-[var(--dq-gold)]",
        tone === "muted" && "bg-[var(--dq-surface-container-high)] text-[var(--muted-foreground)]",
      )}
    >
      {label}
    </span>
  );
}
