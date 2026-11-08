"use client";

import { useFormatter, useTranslations } from "next-intl";

const RARITY_STYLES: Record<string, string> = {
  COMMON: "border-[var(--dq-border)]",
  RARE: "border-[var(--dq-primary)]/40",
  EPIC: "border-purple-400/40",
  LEGENDARY: "border-amber-400/50",
};

export function AchievementsView({
  unlocked,
  all,
  recentNotification,
}: {
  unlocked: Array<{
    unlockedAt: Date;
    achievement: { key: string; title: string; description: string; icon: string; rarity: string };
  }>;
  all: Array<{ key: string; title: string; description: string; icon: string; rarity: string }>;
  recentNotification: {
    achievement: { title: string; description: string; rarity: string };
    unlockedAt: Date;
  } | null;
}) {
  const t = useTranslations("phase4.achievements");
  const format = useFormatter();
  const unlockedKeys = new Set(unlocked.map((u) => u.achievement.key));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("subtitle")}</p>
      </div>

      {recentNotification ? (
        <div className="rounded-xl border border-[var(--dq-primary)]/40 bg-[var(--dq-primary)]/10 p-4">
          <div className="text-xs font-semibold tracking-widest text-[var(--dq-primary)]">
            {t("newAchievement")}
          </div>
          <div className="mt-1 font-medium">{recentNotification.achievement.title}</div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {recentNotification.achievement.description}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((achievement) => {
          const isUnlocked = unlockedKeys.has(achievement.key);
          const unlockedAt = unlocked.find(
            (u) => u.achievement.key === achievement.key,
          )?.unlockedAt;
          return (
            <article
              key={achievement.key}
              className={`dq-card rounded-xl border p-5 ${RARITY_STYLES[achievement.rarity] ?? ""} ${
                !isUnlocked ? "opacity-50" : ""
              }`}
            >
              <div className="text-xs tracking-wide text-[var(--dq-tertiary)] uppercase">
                {achievement.rarity}
              </div>
              <h2 className="mt-2 font-semibold">{achievement.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {achievement.description}
              </p>
              {isUnlocked && unlockedAt ? (
                <p className="mt-3 text-xs text-[var(--dq-primary)]">
                  {t("unlockedAt", { date: format.dateTime(unlockedAt, "date") })}
                </p>
              ) : (
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">{t("locked")}</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
