"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addQuestCommentAction,
  assignQuestMembersAction,
  reviewQuestSubmissionAction,
  startQuestAction,
  submitQuestAction,
} from "@/features/quests/actions/quest.actions";
import { isSoloSelfReview } from "@/lib/permissions/quest-permissions";
import { ProjectMemberRole } from "@prisma/client";

type QuestDetailProps = {
  projectId: string;
  questId: string;
  mode: "SOLO" | "TEAM";
  isLeader: boolean;
  currentUserId: string;
  quest: {
    id: string;
    status: string;
    suggestedDeadline: Date | null;
    questTemplate: {
      title: string;
      description: string;
      businessDescription: string;
      technicalGoal: string;
      acceptanceCriteria: unknown;
      baseXp: number;
      category: string;
      questType: string;
      isMainQuest: boolean;
      difficulty: number;
      estimatedMinutes: number;
      learningResources: unknown;
      skillRewards: Array<{ skill: { key: string; title: string }; xp: number }>;
      dependencies: Array<{
        dependsOnQuestTemplate: { title: string; slug: string; isRequired: boolean };
      }>;
    };
    assignments: Array<{ user: { id: string; name: string | null; email: string } }>;
    submissions: Array<{
      id: string;
      commitUrl: string;
      pullRequestUrl: string | null;
      description: string;
      status: string;
      reviewComment: string | null;
      createdAt: Date;
      submittedBy: { name: string | null; email: string };
      reviewedBy: { name: string | null } | null;
    }>;
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
      author: { name: string | null; email: string };
    }>;
  };
  members: Array<{ userId: string; name: string | null; email: string }>;
  dependencyStatuses: Array<{
    questTemplateId: string;
    status: string;
    questTemplate: { title: string };
  }>;
};

export function QuestDetailView(props: QuestDetailProps) {
  const t = useTranslations("quests.detail");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    props.quest.assignments.map((a) => a.user.id),
  );

  const latestSubmission = props.quest.submissions[0] ?? null;
  const assigneeIds = props.quest.assignments.map((a) => a.user.id);
  const selfReview = isSoloSelfReview(
    props.mode,
    {
      role: props.isLeader ? ProjectMemberRole.LEADER : ProjectMemberRole.MEMBER,
      userId: props.currentUserId,
    },
    assigneeIds,
  );
  const acceptanceCriteria = Array.isArray(props.quest.questTemplate.acceptanceCriteria)
    ? (props.quest.questTemplate.acceptanceCriteria as string[])
    : [];
  const resources = Array.isArray(props.quest.questTemplate.learningResources)
    ? (props.quest.questTemplate.learningResources as Array<{ title: string; url: string }>)
    : [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/app/projects/${props.projectId}/quests`}
          className="text-sm text-[var(--dq-primary)] hover:underline"
        >
          {t("backToBoard")}
        </Link>
        <h1 className="font-heading mt-3 text-3xl text-[var(--foreground)]">
          {props.quest.questTemplate.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
          <span>{props.quest.status}</span>
          <span>{props.quest.questTemplate.baseXp} XP</span>
          <span>{Math.round(props.quest.questTemplate.estimatedMinutes / 60)}h</span>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title={t("businessDescription")}>
            <p>{props.quest.questTemplate.businessDescription}</p>
          </Section>
          <Section title={t("description")}>
            <p>{props.quest.questTemplate.description}</p>
          </Section>
          <Section title={t("technicalGoal")}>
            <p>{props.quest.questTemplate.technicalGoal}</p>
          </Section>
          <Section title={t("acceptanceCriteria")}>
            <ul className="list-disc space-y-1 pl-5">
              {acceptanceCriteria.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
          <Section title={t("dependencies")}>
            <ul className="space-y-2">
              {props.quest.questTemplate.dependencies.map((dep) => {
                const status = props.dependencyStatuses.find(
                  (d) => d.questTemplate.title === dep.dependsOnQuestTemplate.title,
                );
                return (
                  <li
                    key={dep.dependsOnQuestTemplate.slug}
                    className="flex justify-between text-sm"
                  >
                    <span>{dep.dependsOnQuestTemplate.title}</span>
                    <span className="text-[var(--muted-foreground)]">{status?.status ?? "—"}</span>
                  </li>
                );
              })}
              {props.quest.questTemplate.dependencies.length === 0 ? (
                <li className="text-sm text-[var(--muted-foreground)]">{t("noDependencies")}</li>
              ) : null}
            </ul>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title={t("xpRewards")}>
            <ul className="space-y-1 text-sm">
              {props.quest.questTemplate.skillRewards.map((r) => (
                <li key={r.skill.key}>
                  {r.skill.title}: {r.xp} XP
                </li>
              ))}
              {props.quest.questTemplate.skillRewards.length === 0 ? (
                <li>{props.quest.questTemplate.baseXp} XP</li>
              ) : null}
            </ul>
          </Section>

          {resources.length > 0 ? (
            <Section title={t("resources")}>
              <ul className="space-y-1 text-sm">
                {resources.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      className="text-[var(--dq-primary)] hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {props.isLeader ? (
            <Section title={t("assignMembers")}>
              <div className="space-y-2">
                {props.members.map((m) => (
                  <label key={m.userId} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(m.userId)}
                      onChange={(e) => {
                        setSelectedAssignees((prev) =>
                          e.target.checked
                            ? [...prev, m.userId]
                            : prev.filter((id) => id !== m.userId),
                        );
                      }}
                    />
                    {m.name || m.email}
                  </label>
                ))}
              </div>
              <Button
                className="mt-3 w-full"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    try {
                      await assignQuestMembersAction(
                        props.projectId,
                        props.questId,
                        selectedAssignees,
                      );
                    } catch {
                      setError(t("errors.generic"));
                    }
                  })
                }
              >
                {t("saveAssignment")}
              </Button>
            </Section>
          ) : null}

          {props.quest.status === "AVAILABLE" ? (
            <Button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await startQuestAction(props.projectId, props.questId);
                  if (!res.ok) setError(t(`errors.${res.error ?? "generic"}`));
                  else window.location.reload();
                })
              }
            >
              {t("startQuest")}
            </Button>
          ) : null}
        </div>
      </div>

      {(props.quest.status === "IN_PROGRESS" || props.quest.status === "CHANGES_REQUIRED") &&
      (props.isLeader || assigneeIds.includes(props.currentUserId)) ? (
        <Section title={t("submission")}>
          <p className="mb-4 text-xs text-[var(--muted-foreground)]">{t("submissionHint")}</p>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              startTransition(async () => {
                setError(null);
                const res = await submitQuestAction(
                  props.projectId,
                  props.questId,
                  new FormData(form),
                );
                if (!res.ok) setError(t(`errors.${res.error ?? "generic"}`));
                else window.location.reload();
              });
            }}
          >
            <div>
              <Label htmlFor="commitUrl">{t("commitUrl")}</Label>
              <Input
                id="commitUrl"
                name="commitUrl"
                placeholder="https://github.com/org/repo/commit/abc123"
                required
              />
            </div>
            <div>
              <Label htmlFor="pullRequestUrl">{t("pullRequestUrl")}</Label>
              <Input
                id="pullRequestUrl"
                name="pullRequestUrl"
                placeholder="https://github.com/org/repo/pull/1"
              />
            </div>
            <div>
              <Label htmlFor="description">{t("solutionDescription")}</Label>
              <textarea
                id="description"
                name="description"
                required
                minLength={10}
                className="mt-1 min-h-24 w-full rounded-md border border-[var(--dq-border)] bg-[var(--dq-surface-container-high)] px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" disabled={pending} data-testid="quest-submit">
              {t("submitForReview")}
            </Button>
          </form>
        </Section>
      ) : null}

      {props.quest.status === "REVIEW" && latestSubmission && (props.isLeader || selfReview) ? (
        <Section title={selfReview ? t("selfReviewTitle") : t("leaderReview")}>
          {selfReview ? (
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              {t("selfReviewNotice")}
            </p>
          ) : null}
          <div className="text-sm text-[var(--muted-foreground)]">
            <div>{latestSubmission.commitUrl}</div>
            {latestSubmission.pullRequestUrl ? <div>{latestSubmission.pullRequestUrl}</div> : null}
            <p className="mt-2">{latestSubmission.description}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={pending}
              data-testid="quest-accept"
              onClick={() =>
                startTransition(async () => {
                  await reviewQuestSubmissionAction(props.projectId, props.questId, {
                    submissionId: latestSubmission.id,
                    decision: "ACCEPTED",
                  });
                  window.location.reload();
                })
              }
            >
              {t("accept")}
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => {
                const comment = window.prompt(t("reviewCommentPrompt"));
                if (comment === null) return;
                startTransition(async () => {
                  await reviewQuestSubmissionAction(props.projectId, props.questId, {
                    submissionId: latestSubmission.id,
                    decision: "CHANGES_REQUIRED",
                    reviewComment: comment,
                  });
                  window.location.reload();
                });
              }}
            >
              {t("requestChanges")}
            </Button>
          </div>
        </Section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={t("comments")}>
          <ul className="space-y-3">
            {props.quest.comments.map((c) => (
              <li key={c.id} className="rounded-lg border border-[var(--dq-border)] p-3 text-sm">
                <div className="font-medium">{c.author.name || c.author.email}</div>
                <p className="mt-1 text-[var(--muted-foreground)]">{c.content}</p>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const content = new FormData(form).get("content");
              if (typeof content !== "string") return;
              startTransition(async () => {
                await addQuestCommentAction(props.projectId, props.questId, content);
                window.location.reload();
              });
            }}
          >
            <textarea
              name="content"
              required
              className="min-h-20 w-full rounded-md border border-[var(--dq-border)] bg-[var(--dq-surface-container-high)] px-3 py-2 text-sm"
              placeholder={t("commentPlaceholder")}
            />
            <Button type="submit" size="sm" disabled={pending}>
              {t("addComment")}
            </Button>
          </form>
        </Section>

        <Section title={t("activity")}>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            {props.quest.submissions.map((s) => (
              <li key={s.id}>
                {s.status} · {s.submittedBy.name || s.submittedBy.email} ·{" "}
                {s.createdAt.toLocaleString()}
              </li>
            ))}
            {props.quest.submissions.length === 0 ? <li>{t("noActivity")}</li> : null}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="dq-card rounded-xl p-5">
      <h2 className="text-sm font-semibold tracking-wide text-[var(--dq-primary)]">{title}</h2>
      <div className="mt-3 text-sm text-[var(--foreground)]">{children}</div>
    </section>
  );
}
