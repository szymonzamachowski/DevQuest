import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Clock, Layers, Target, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

type CampaignDetailProps = {
  campaign: {
    id: string;
    slug: string;
    title: string;
    description: string;
    businessProblem: string;
    projectGoal: string;
    scope: string;
    difficulty: string;
    estimatedDuration: string;
    minimumTeamSize: number;
    maximumTeamSize: number;
    supportsSolo: boolean;
    coverImage: string | null;
    skillKeys: string[];
    prerequisites: string[];
    stats: {
      chapterCount: number;
      questCount: number;
      requiredQuestCount: number;
      totalXp: number;
      estimatedHours: number;
    };
    chapters: Array<{
      id: string;
      title: string;
      order: number;
      description: string;
      questCount: number;
    }>;
  };
  startHref: string;
};

export async function CampaignDetailView({ campaign, startHref }: CampaignDetailProps) {
  const t = await getTranslations("campaigns.detail");

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-7">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-4xl tracking-[-0.02em] text-[var(--foreground)] md:text-5xl">
              {campaign.title}
            </h1>
            <div className="h-px flex-1 bg-gradient-to-r from-[rgba(173,198,255,0.25)] to-transparent" />
          </div>
          <p className="text-lg leading-8 text-[var(--muted-foreground)]">{campaign.description}</p>

          <div className="dq-card space-y-4 p-6">
            <h2 className="text-sm font-semibold text-[var(--dq-primary)]">
              {t("businessProblem")}
            </h2>
            <p className="text-sm leading-7 text-[var(--foreground)]">{campaign.businessProblem}</p>
          </div>

          <div className="dq-card space-y-4 p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--dq-primary)]">
              <Target className="h-4 w-4" />
              {t("projectGoal")}
            </h2>
            <p className="text-sm leading-7 text-[var(--foreground)]">{campaign.projectGoal}</p>
          </div>

          <div className="dq-card space-y-4 p-6">
            <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("scope")}</h2>
            <p className="text-sm leading-7 text-[var(--foreground)]">{campaign.scope}</p>
          </div>
        </section>

        <aside className="space-y-4 lg:col-span-5">
          <div className="dq-card overflow-hidden">
            {campaign.coverImage ? (
              <div className="relative h-48 w-full">
                <Image
                  src={campaign.coverImage}
                  unoptimized
                  alt={campaign.title}
                  fill
                  className="object-cover [image-rendering:pixelated]"
                />
              </div>
            ) : null}
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="border border-[var(--dq-border)] bg-[var(--dq-surface-container)] p-3">
                  <div className="text-xs text-[var(--muted-foreground)]">{t("difficulty")}</div>
                  <div className="font-medium">{campaign.difficulty}</div>
                </div>
                <div className="border border-[var(--dq-border)] bg-[var(--dq-surface-container)] p-3">
                  <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                    <Clock className="h-3 w-3" /> {t("duration")}
                  </div>
                  <div className="font-medium">{campaign.estimatedDuration}</div>
                </div>
                <div className="border border-[var(--dq-border)] bg-[var(--dq-surface-container)] p-3">
                  <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                    <Users className="h-3 w-3" /> {t("teamSize")}
                  </div>
                  <div className="font-medium">
                    {campaign.minimumTeamSize}-{campaign.maximumTeamSize}
                  </div>
                </div>
                <div className="border border-[var(--dq-border)] bg-[var(--dq-surface-container)] p-3">
                  <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                    <Layers className="h-3 w-3" /> {t("quests")}
                  </div>
                  <div className="font-medium">{campaign.stats.questCount}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {campaign.skillKeys.map((skill) => (
                  <span
                    key={skill}
                    className="border border-[var(--dq-border)] px-2 py-1 text-xs text-[var(--dq-primary)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {campaign.prerequisites.length > 0 ? (
                <div>
                  <div className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">
                    {t("prerequisites")}
                  </div>
                  <ul className="space-y-1 text-sm text-[var(--foreground)]">
                    {campaign.prerequisites.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="text-[var(--dq-primary)]">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button asChild className="h-11 w-full">
                <Link href={startHref}>{t("startCampaign")}</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-[var(--foreground)]">{t("chapters")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {campaign.chapters.map((chapter) => (
            <div key={chapter.id} className="dq-card dq-hover-glow p-5">
              <div className="mb-2 text-xs font-semibold text-[var(--dq-tertiary)]">
                {t("chapter")} {chapter.order}
              </div>
              <h3 className="mb-2 font-semibold text-[var(--foreground)]">{chapter.title}</h3>
              <p className="mb-3 text-sm text-[var(--muted-foreground)]">{chapter.description}</p>
              <div className="text-xs text-[var(--dq-primary)]">
                {chapter.questCount} {t("questsInChapter")}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
