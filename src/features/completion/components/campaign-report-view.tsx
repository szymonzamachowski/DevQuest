"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { completeCampaignAction } from "@/features/completion/actions/completion.actions";
import { Button } from "@/components/ui/button";
import { PixelMeter } from "@/components/ui/pixel-meter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeamReportPayload } from "@/lib/services/final-report.service";

type ReportViewProps = {
  projectId: string;
  projectStatus: string;
  isLeader: boolean;
  isSolo: boolean;
  eligibility: {
    eligible: boolean;
    missing: string[];
    stats: {
      requiredMainTotal: number;
      requiredMainCompleted: number;
      optionalCompleted: number;
      optionalTotal: number;
    };
  };
  canComplete: boolean;
  initial: {
    repositoryUrl: string | null;
    liveDemoUrl: string | null;
    solutionDescription: string | null;
    isPublic: boolean;
    publicSlug: string | null;
  };
  report: {
    finalGrade: string;
    finalHealth: number;
    completionScore: number;
    teamworkScore: number;
    testingScore: number;
    documentationScore: number;
    adaptabilityScore: number;
    summary: string;
    reportPayload: TeamReportPayload | null;
    generatedAt: Date;
    userReports: Array<{
      userId: string;
      user: { name: string | null; email: string };
      questsCompleted: number;
      commitsSubmitted: number;
      reviewsCompleted: number;
      contributionSummary: string;
      strongestSkills: unknown;
      improvementAreas: unknown;
      finalScore: number;
      skillXpBreakdown: unknown;
      roleContribution: unknown;
      suggestedNextDirection: string;
    }>;
  } | null;
  currentUserId: string;
  publicSlug: string | null;
};

export function CampaignReportView(props: ReportViewProps) {
  const t = useTranslations("phase5.report");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [isPublic, setIsPublic] = useState(props.initial.isPublic);

  const userReport =
    props.report?.userReports.find((r) => r.userId === props.currentUserId) ?? null;
  const payload = props.report?.reportPayload ?? null;

  if (props.projectStatus !== "COMPLETED") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl leading-none text-[var(--dq-parchment)]">
            {t("preCompletionTitle")}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {t("preCompletionSubtitle")}
          </p>
        </div>

        <section className="dq-card space-y-6 p-6">
          <h2 className="text-lg text-[var(--dq-gold)]">{t("requirements")}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <PixelMeter
              label={t("requiredMainProgress", {
                done: props.eligibility.stats.requiredMainCompleted,
                total: props.eligibility.stats.requiredMainTotal,
              })}
              value={percent(
                props.eligibility.stats.requiredMainCompleted,
                props.eligibility.stats.requiredMainTotal,
              )}
              tone={props.eligibility.eligible ? "moss" : "gold"}
            />
            <PixelMeter
              label={t("optionalProgress", {
                done: props.eligibility.stats.optionalCompleted,
                total: props.eligibility.stats.optionalTotal,
              })}
              value={percent(
                props.eligibility.stats.optionalCompleted,
                props.eligibility.stats.optionalTotal,
              )}
              tone="mana"
            />
          </div>
          <ul className="space-y-2">
            {props.eligibility.missing.map((m) => (
              <li key={m} className="flex gap-3">
                <span aria-hidden className="mt-2 size-2 shrink-0 bg-[var(--dq-ember)]" />
                <span>{m}</span>
              </li>
            ))}
            {props.eligibility.eligible ? (
              <li className="text-[var(--dq-moss)]">{t("allRequirementsMet")}</li>
            ) : null}
          </ul>
        </section>

        {!props.canComplete ? (
          <p className="text-[var(--muted-foreground)]">
            {props.isLeader || props.isSolo ? t("notEligibleYet") : t("leaderOnly")}
          </p>
        ) : (
          <section className="dq-card p-5">
            <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("completeForm")}</h2>
            {error ? <p className="mt-2 text-sm text-[var(--dq-blood)]">{error}</p> : null}
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                startTransition(async () => {
                  setError(null);
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  fd.set("isPublic", isPublic ? "true" : "false");
                  const res = await completeCampaignAction(props.projectId, fd);
                  if (!res.ok) setError(t(`errors.${res.error ?? "generic"}`));
                  else window.location.reload();
                });
              }}
            >
              <div>
                <Label htmlFor="solutionDescription">{t("solutionDescription")}</Label>
                <textarea
                  id="solutionDescription"
                  name="solutionDescription"
                  required
                  minLength={20}
                  defaultValue={props.initial.solutionDescription ?? ""}
                  className="mt-1 min-h-28 w-full border border-[var(--dq-border)] bg-[var(--dq-surface-container-high)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="repositoryUrl">{t("repositoryUrl")}</Label>
                <Input
                  id="repositoryUrl"
                  name="repositoryUrl"
                  defaultValue={props.initial.repositoryUrl ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="liveDemoUrl">{t("liveDemoUrl")}</Label>
                <Input
                  id="liveDemoUrl"
                  name="liveDemoUrl"
                  defaultValue={props.initial.liveDemoUrl ?? ""}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                {t("makePublic")}
              </label>
              {isPublic ? (
                <div>
                  <Label htmlFor="publicSlug">{t("publicSlug")}</Label>
                  <Input
                    id="publicSlug"
                    name="publicSlug"
                    pattern="[a-z0-9-]+"
                    defaultValue={props.initial.publicSlug ?? "brightlane-booking"}
                  />
                </div>
              ) : null}
              <Button type="submit" disabled={pending || !props.eligibility.eligible}>
                {t("confirmComplete")}
              </Button>
            </form>
          </section>
        )}
      </div>
    );
  }

  if (!props.report) {
    return (
      <div className="dq-card p-8 text-center text-sm text-[var(--muted-foreground)]">
        {t("reportNotReady")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl leading-none text-[var(--dq-parchment)]">
            {t("finalReportTitle")}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{props.report.summary}</p>
        </div>
        {props.publicSlug ? (
          <Button asChild variant="outline">
            <Link href={`/projects/${props.publicSlug}`} target="_blank">
              {t("viewPublicPage")}
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat label={t("grade")} value={props.report.finalGrade} />
        <Stat label={t("health")} value={String(props.report.finalHealth)} />
        <Stat label={t("completion")} value={`${props.report.completionScore}%`} />
        <Stat label={t("teamwork")} value={`${props.report.teamworkScore}%`} />
        <Stat label={t("testing")} value={`${props.report.testingScore}%`} />
        <Stat label={t("adaptability")} value={`${props.report.adaptabilityScore}%`} />
      </div>

      {payload ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="dq-card p-5">
            <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("teamSummary")}</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>{t("duration", { days: payload.durationDays })}</li>
              <li>
                {t("questsCompleted", {
                  required: payload.requiredQuestsCompleted,
                  requiredTotal: payload.requiredQuestsTotal,
                  optional: payload.optionalQuestsCompleted,
                })}
              </li>
              <li>{t("strongestAreas", { areas: payload.strongestAreas.join(", ") })}</li>
            </ul>
            {payload.recommendations.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {t("recommendations")}
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {payload.recommendations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="dq-card p-5">
            <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("yourReport")}</h2>
            {userReport ? (
              <div className="mt-3 space-y-2 text-sm">
                <p>{userReport.contributionSummary}</p>
                <p>{t("yourScore", { score: userReport.finalScore })}</p>
                <p>{t("nextDirection", { direction: userReport.suggestedNextDirection })}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                {t("noIndividualReport")}
              </p>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="dq-card p-4">
      <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function percent(done: number, total: number) {
  return total > 0 ? (done / total) * 100 : 0;
}
