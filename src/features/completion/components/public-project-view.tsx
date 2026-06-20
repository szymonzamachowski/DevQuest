import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

type PublicProject = NonNullable<
  Awaited<ReturnType<typeof import("@/features/completion/queries/completion").getPublicProject>>
>;

export async function PublicProjectView({
  project,
  highlightUserId,
}: {
  project: PublicProject;
  highlightUserId?: string;
}) {
  const t = await getTranslations("phase5.public");
  const report = project.finalReport;
  const payload = report?.reportPayload as {
    strongestAreas?: string[];
    achievements?: Array<{ title: string; rarity: string }>;
  } | null;

  const stack = (project.techStack ?? {}) as Record<string, string | undefined>;
  const stackEntries = Object.entries(stack).filter(([, v]) => v && v !== "None");
  const screenshots = Array.isArray(project.screenshots) ? (project.screenshots as string[]) : [];

  const highlightMember = highlightUserId
    ? project.members.find((m) => m.userId === highlightUserId)
    : null;
  const highlightReport = highlightUserId
    ? project.finalReport?.userReports.find((r) => r.userId === highlightUserId)
    : null;

  const completedQuests = project.projectQuests.map((q) => q.questTemplate.title);

  return (
    <article className="space-y-10">
      <header className="space-y-4 border-b border-[var(--dq-border)] pb-8">
        <p className="text-xs font-semibold tracking-widest text-[var(--dq-primary)] uppercase">
          {t("portfolioProject")}
        </p>
        <h1 className="font-heading text-4xl tracking-tight text-[var(--foreground)]">
          {project.title}
        </h1>
        <p className="max-w-3xl text-lg text-[var(--muted-foreground)]">
          {project.campaignTemplate.projectGoal}
        </p>
        {project.completedAt ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            {t("completedOn", { date: project.completedAt.toLocaleDateString() })}
          </p>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="text-lg font-semibold">{t("businessProblem")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {project.campaignTemplate.businessProblem}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">{t("solution")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {project.solutionDescription ?? t("noSolutionDescription")}
            </p>
          </div>

          {stackEntries.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold">{t("techStack")}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {stackEntries.map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded-full border border-[var(--dq-border)] bg-[var(--dq-surface-container-low)] px-3 py-1 text-xs"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {completedQuests.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold">{t("deliveredScope")}</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {completedQuests.slice(0, 12).map((title) => (
                  <li key={title} className="text-sm text-[var(--muted-foreground)]">
                    • {title}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h2 className="text-lg font-semibold">{t("screenshots")}</h2>
            {screenshots.length > 0 ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {screenshots.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="rounded-lg border border-[var(--dq-border)]"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-[var(--dq-border)] p-8 text-center text-sm text-[var(--muted-foreground)]">
                {t("screenshotsPlaceholder")}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          {report ? (
            <div className="dq-card rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("outcome")}</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">{t("grade")}</dt>
                  <dd className="font-semibold">{report.finalGrade}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">{t("projectHealth")}</dt>
                  <dd>{report.finalHealth}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">{t("teamwork")}</dt>
                  <dd>{report.teamworkScore}%</dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="dq-card rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[var(--dq-primary)]">{t("team")}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {project.members.map((m) => (
                <li key={m.userId}>
                  <div className="font-medium">{m.user.name ?? m.user.email}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Level {m.user.level} · {m.teamworkXp} teamwork XP
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {highlightMember && highlightReport ? (
            <div className="dq-card rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[var(--dq-primary)]">
                {t("memberContribution")}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {highlightReport.contributionSummary}
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {t("memberScore", { score: highlightReport.finalScore })}
              </p>
            </div>
          ) : null}

          {(payload?.achievements?.length ?? project.userAchievements.length) > 0 ? (
            <div className="dq-card rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[var(--dq-primary)]">
                {t("achievements")}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {(
                  payload?.achievements ??
                  project.userAchievements.map((ua) => ({
                    title: ua.achievement.title,
                    rarity: ua.achievement.rarity,
                  }))
                )
                  .slice(0, 6)
                  .map((a) => (
                    <li key={a.title}>{a.title}</li>
                  ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {project.repositoryUrl ? (
              <Button asChild className="w-full">
                <Link href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                  {t("viewRepository")}
                </Link>
              </Button>
            ) : null}
            {project.liveDemoUrl ? (
              <Button asChild variant="outline" className="w-full">
                <Link href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                  {t("viewLiveDemo")}
                </Link>
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  );
}
