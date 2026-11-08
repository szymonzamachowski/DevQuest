"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Lock } from "lucide-react";

import { AchievementIcon } from "@/components/ui/achievement-icon";
import { PixelMeter, rarityText } from "@/components/ui/pixel-meter";
import { cn } from "@/lib/utils";

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

  const tRarity = useTranslations("phase4.dashboard.rarity");

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl leading-none text-[var(--dq-parchment)]">{t("title")}</h1>
          <p className="text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </div>
        <PixelMeter
          className="w-full max-w-xs"
          label={t("progress", { unlocked: unlockedKeys.size, total: all.length })}
          value={all.length ? (unlockedKeys.size / all.length) * 100 : 0}
        />
      </div>

      {recentNotification ? (
        <div className="dq-card dq-card--quest dq-animate-achievement flex items-center gap-5 p-5">
          <div className="text-[var(--dq-gold)]">{t("newAchievement")}</div>
          <div>
            <div className="text-xl text-[var(--dq-parchment)]">
              {recentNotification.achievement.title}
            </div>
            <p className="text-[var(--muted-foreground)]">
              {recentNotification.achievement.description}
            </p>
          </div>
        </div>
      ) : null}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((achievement) => {
          const unlockedAt = unlocked.find(
            (u) => u.achievement.key === achievement.key,
          )?.unlockedAt;
          return (
            <li
              key={achievement.key}
              className={cn("dq-card flex gap-4 p-5", !unlockedAt && "opacity-55 saturate-0")}
            >
              <div
                className={cn(
                  "flex size-16 shrink-0 items-center justify-center bg-[var(--dq-ink)]",
                  unlockedAt ? rarityText[achievement.rarity] : "text-[var(--dq-outline)]",
                )}
              >
                {unlockedAt ? (
                  <AchievementIcon name={achievement.icon} className="size-8" />
                ) : (
                  <Lock aria-hidden className="size-7" />
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <div className={rarityText[achievement.rarity]}>{tRarity(achievement.rarity)}</div>
                <h2 className="text-lg leading-tight text-[var(--dq-parchment)]">
                  {achievement.title}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">{achievement.description}</p>
                <p className="pt-1 text-sm text-[var(--dq-outline)]">
                  {unlockedAt
                    ? t("unlockedAt", { date: format.dateTime(unlockedAt, "date") })
                    : t("locked")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
