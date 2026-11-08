import Image from "next/image";
import Link from "next/link";
import { Clock, Code2, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { CampaignListItem } from "@/features/campaigns/queries/campaigns";
import { cn } from "@/lib/utils";

function difficultyLabel(
  difficulty: CampaignListItem["difficulty"],
  t: ReturnType<typeof useTranslations>,
) {
  const map = {
    BEGINNER: t("difficulty.beginner"),
    INTERMEDIATE: t("difficulty.intermediate"),
    ADVANCED: t("difficulty.advanced"),
  } as const;
  return map[difficulty];
}

export function CampaignCard({
  campaign,
  featured = false,
}: {
  campaign: CampaignListItem;
  featured?: boolean;
}) {
  const t = useTranslations("campaigns");

  return (
    <article
      className={cn(
        "dq-card dq-hover-glow overflow-hidden",
        featured ? "col-span-1 flex flex-col md:col-span-2 md:flex-row" : "flex flex-col",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[var(--dq-surface-container-high)]",
          featured ? "h-64 w-full md:h-auto md:w-1/2" : "h-48 w-full",
        )}
      >
        {campaign.coverImage ? (
          <Image
            src={campaign.coverImage}
            unoptimized
            alt={campaign.title}
            fill
            className="object-cover [image-rendering:pixelated]"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "400px"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--dq-outline)]">
            <Code2 className="h-12 w-12" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-[var(--dq-surface-dim)]/80 px-2 py-1 font-mono text-xs text-[var(--foreground)] backdrop-blur-md">
          {difficultyLabel(campaign.difficulty, t)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-[var(--foreground)]">{campaign.title}</h3>
          <span className="shrink-0 bg-[color-mix(in_oklab,var(--dq-primary)_20%,transparent)] px-2 py-1 font-mono text-sm text-[var(--dq-primary)]">
            {campaign.questCount} {t("stats.quests")}
          </span>
        </div>

        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-6 text-[var(--muted-foreground)]">
          {campaign.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {campaign.estimatedDuration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {campaign.minimumTeamSize}-{campaign.maximumTeamSize} {t("stats.devs")}
          </span>
          {campaign.supportsSolo ? (
            <span className="border border-[var(--dq-border)] px-2 py-0.5 text-[var(--dq-primary)]">
              {t("modes.solo")}
            </span>
          ) : null}
        </div>

        {campaign.skillKeys.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {campaign.skillKeys.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="border border-[var(--dq-border)] bg-[var(--dq-surface-container)] px-2 py-0.5 text-sm text-[var(--muted-foreground)]"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}

        <Button asChild className="h-11 w-full">
          <Link href={`/campaigns/${campaign.slug}`}>{t("viewDetails")}</Link>
        </Button>
      </div>
    </article>
  );
}
