"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type ProfileProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    level: number;
    totalXp: number;
    preferredDirection: string | null;
    userSkills: Array<{ xp: number; skill: { key: string; title: string } }>;
    userAchievements: Array<{
      unlockedAt: Date;
      achievement: { title: string; description: string; rarity: string };
      project: { title: string; publicSlug: string | null; isPublic: boolean } | null;
    }>;
    projectMembers: Array<{
      contributionScore: number;
      teamworkXp: number;
      project: {
        id: string;
        title: string;
        status: string;
        isPublic: boolean;
        publicSlug: string | null;
        completedAt: Date | null;
        campaignTemplate: { title: string };
      };
    }>;
  };
};

export function UserProfileView({ user }: ProfileProps) {
  const t = useTranslations("phase5.profile");

  const completedCampaigns = user.projectMembers.filter((m) => m.project.status === "COMPLETED");
  const publicProjects = completedCampaigns.filter(
    (m) => m.project.isPublic && m.project.publicSlug,
  );
  const totalContribution = user.projectMembers.reduce((s, m) => s + m.contributionScore, 0);
  const totalTeamworkXp = user.projectMembers.reduce((s, m) => s + m.teamworkXp, 0);
  const sortedSkills = [...user.userSkills].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{user.name ?? user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("level")} value={String(user.level)} />
        <StatCard label={t("totalXp")} value={String(user.totalXp)} />
        <StatCard label={t("completedCampaigns")} value={String(completedCampaigns.length)} />
        <StatCard label={t("achievementsCount")} value={String(user.userAchievements.length)} />
      </div>

      <section className="dq-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--dq-primary)]">
          {t("contributionSummary")}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {t("contributionText", {
            projects: user.projectMembers.length,
            score: totalContribution,
            teamworkXp: totalTeamworkXp,
          })}
        </p>
        {user.preferredDirection ? (
          <p className="mt-2 text-sm">
            {t("preferredDirection")}:{" "}
            <span className="text-[var(--foreground)]">{user.preferredDirection}</span>
          </p>
        ) : null}
      </section>

      <section className="dq-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("skillXp")}</h2>
        {sortedSkills.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("noSkills")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {sortedSkills.map((s) => (
              <li key={s.skill.key} className="flex items-center justify-between text-sm">
                <span>{s.skill.title}</span>
                <span className="font-medium text-[var(--dq-primary)]">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dq-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--dq-primary)]">
          {t("completedCampaignsTitle")}
        </h2>
        {completedCampaigns.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("noCampaigns")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {completedCampaigns.map((m) => (
              <li
                key={m.project.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <div>
                  <div className="font-medium">{m.project.title}</div>
                  <div className="text-[var(--muted-foreground)]">
                    {m.project.campaignTemplate.title}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/app/projects/${m.project.id}/report`}>{t("viewReport")}</Link>
                  </Button>
                  {m.project.isPublic && m.project.publicSlug ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/projects/${m.project.publicSlug}`} target="_blank">
                        {t("publicPage")}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dq-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("publicProjects")}</h2>
        {publicProjects.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("noPublicProjects")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {publicProjects.map((m) => (
              <li key={m.project.id}>
                <Link
                  href={`/projects/${m.project.publicSlug}`}
                  className="text-sm text-[var(--dq-primary)] hover:underline"
                >
                  {m.project.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dq-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("achievements")}</h2>
        {user.userAchievements.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("noAchievements")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {user.userAchievements.slice(0, 12).map((ua) => (
              <li
                key={`${ua.achievement.title}-${ua.unlockedAt.toISOString()}`}
                className="text-sm"
              >
                <div className="font-medium">{ua.achievement.title}</div>
                <div className="text-[var(--muted-foreground)]">{ua.achievement.description}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="dq-card rounded-xl p-4">
      <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
