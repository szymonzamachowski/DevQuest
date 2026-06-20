"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { SetupStep } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveRolesAction,
  continueRoleApprovalAction,
  continueRolesStepAction,
  continueTeamStepAction,
  inviteMemberAction,
  launchCampaignAction,
  saveStackAction,
  selectModeAction,
  setPreferredRolesAction,
} from "@/features/projects/actions/setup.actions";
import type { StackAssessmentResult } from "@/lib/services/stack-assessment.service";
import { TEAM_ROLE_KEYS, type TeamRoles } from "@/types/team-roles";
import { STACK_OPTIONS, type TechStack } from "@/types/tech-stack";
import { cn } from "@/lib/utils";

type Member = {
  userId: string;
  role: string;
  name: string | null;
  email: string;
  preferredRoles: TeamRoles;
  approvedRoles: TeamRoles;
};

export type SetupWizardProps = {
  projectId: string;
  campaignTitle: string;
  setupStep: SetupStep;
  mode: "SOLO" | "TEAM";
  supportsSolo: boolean;
  maxTeamSize: number;
  members: Member[];
  isLeader: boolean;
  currentUserId: string;
  techStack: TechStack | null;
  stackAssessment: StackAssessmentResult | null;
  criticalCoverage: {
    engineering: boolean;
    testing: boolean;
    documentation: boolean;
    isComplete: boolean;
    missing: string[];
  };
};

function RoleCheckbox({
  role,
  checked,
  onChange,
  disabled,
}: {
  role: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-container)] px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-[var(--dq-outline)]"
      />
      <span className="capitalize">{role.replace("_", "/")}</span>
    </label>
  );
}

export function SetupWizard(props: SetupWizardProps) {
  const t = useTranslations("setup");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<TeamRoles>(
    props.members.find((m) => m.userId === props.currentUserId)?.preferredRoles ?? [],
  );
  const [stack, setStack] = useState<TechStack>(props.techStack ?? {});
  const [assessment, setAssessment] = useState<StackAssessmentResult | null>(props.stackAssessment);

  const step = props.setupStep;

  function refresh() {
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="text-xs font-semibold tracking-widest text-[var(--dq-primary)] uppercase">
          {t("wizardLabel")}
        </div>
        <h1 className="font-heading text-3xl text-[var(--foreground)]">{props.campaignTitle}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t(`steps.${step}`)}</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-[var(--dq-error)]/30 bg-[var(--dq-error)]/10 px-4 py-3 text-sm text-[var(--dq-error)]">
          {error}
        </div>
      ) : null}

      {step === "MODE" ? (
        <div className="dq-card grid gap-4 rounded-xl p-6 sm:grid-cols-2">
          {props.supportsSolo ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  try {
                    await selectModeAction(props.projectId, "SOLO");
                    refresh();
                  } catch {
                    setError(t("errors.generic"));
                  }
                })
              }
              className="dq-hover-glow rounded-xl border border-[var(--dq-border)] p-6 text-left transition-colors hover:border-[var(--dq-primary)]/50"
            >
              <div className="text-lg font-semibold">{t("mode.soloTitle")}</div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {t("mode.soloDescription")}
              </p>
            </button>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  await selectModeAction(props.projectId, "TEAM");
                  refresh();
                } catch {
                  setError(t("errors.generic"));
                }
              })
            }
            className="dq-hover-glow rounded-xl border border-[var(--dq-border)] p-6 text-left transition-colors hover:border-[var(--dq-primary)]/50"
          >
            <div className="text-lg font-semibold">{t("mode.teamTitle")}</div>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {t("mode.teamDescription")}
            </p>
          </button>
        </div>
      ) : null}

      {step === "TEAM" && props.isLeader ? (
        <div className="dq-card space-y-6 rounded-xl p-6">
          <div>
            <h2 className="font-semibold">{t("team.title")}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("team.subtitle", { current: props.members.length, max: props.maxTeamSize })}
            </p>
          </div>
          <ul className="space-y-2">
            {props.members.map((m) => (
              <li
                key={m.userId}
                className="flex items-center justify-between rounded-lg border border-[var(--dq-border)] px-4 py-3 text-sm"
              >
                <span>{m.name || m.email}</span>
                <span className="text-xs text-[var(--dq-primary)]">{m.role}</span>
              </li>
            ))}
          </ul>
          {props.members.length < props.maxTeamSize ? (
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData();
                fd.set("email", inviteEmail);
                startTransition(async () => {
                  setError(null);
                  const res = await inviteMemberAction(props.projectId, fd);
                  if (!res.ok) {
                    setError(t(`errors.${res.error}` as "errors.USER_NOT_FOUND"));
                    return;
                  }
                  setInviteEmail("");
                  refresh();
                });
              }}
            >
              <Input
                type="email"
                placeholder={t("team.emailPlaceholder")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={pending}>
                {t("team.invite")}
              </Button>
            </form>
          ) : null}
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await continueTeamStepAction(props.projectId);
                refresh();
              })
            }
          >
            {t("continue")}
          </Button>
        </div>
      ) : null}

      {step === "ROLES" ? (
        <div className="dq-card space-y-6 rounded-xl p-6">
          <h2 className="font-semibold">{t("roles.title")}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{t("roles.subtitle")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {TEAM_ROLE_KEYS.map((role) => (
              <RoleCheckbox
                key={role}
                role={role}
                checked={selectedRoles.includes(role)}
                onChange={(checked) =>
                  setSelectedRoles((prev) =>
                    checked ? [...prev, role] : prev.filter((r) => r !== role),
                  )
                }
              />
            ))}
          </div>
          <Button
            disabled={pending || selectedRoles.length === 0}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  await setPreferredRolesAction(props.projectId, selectedRoles);
                  const stepRes = await continueRolesStepAction(props.projectId);
                  if (stepRes.ok === false && stepRes.error === "ROLES_PENDING") {
                    setError(t("roles.pendingTeam"));
                    return;
                  }
                  if ("waiting" in stepRes && stepRes.waiting) {
                    setError(null);
                  }
                  refresh();
                } catch {
                  setError(t("errors.generic"));
                }
              })
            }
          >
            {t("continue")}
          </Button>
        </div>
      ) : null}

      {step === "ROLE_APPROVAL" && props.isLeader ? (
        <div className="dq-card space-y-6 rounded-xl p-6">
          <h2 className="font-semibold">{t("approval.title")}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{t("approval.subtitle")}</p>
          {props.members.map((member) => (
            <MemberRoleApproval
              key={member.userId}
              member={member}
              projectId={props.projectId}
              leaderId={props.currentUserId}
              mode={props.mode}
              onDone={refresh}
            />
          ))}
          <div className="rounded-lg border border-[var(--dq-border)] p-4 text-sm">
            <div className="mb-2 font-medium">{t("approval.criticalCoverage")}</div>
            <CoverageIndicators coverage={props.criticalCoverage} />
          </div>
          <Button
            disabled={pending || !props.criticalCoverage.isComplete}
            onClick={() =>
              startTransition(async () => {
                await continueRoleApprovalAction(props.projectId);
                refresh();
              })
            }
          >
            {t("continue")}
          </Button>
        </div>
      ) : null}

      {step === "STACK" && props.isLeader ? (
        <div className="dq-card space-y-6 rounded-xl p-6">
          <h2 className="font-semibold">{t("stack.title")}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{t("stack.subtitle")}</p>
          {(Object.keys(STACK_OPTIONS) as Array<keyof typeof STACK_OPTIONS>).map((category) => (
            <div key={category} className="space-y-2">
              <Label className="capitalize">{category}</Label>
              <select
                className="h-11 w-full rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-dim)] px-3 text-sm"
                value={stack[category] ?? ""}
                onChange={(e) =>
                  setStack((s) => ({ ...s, [category]: e.target.value || undefined }))
                }
              >
                <option value="">{t("stack.selectOption")}</option>
                {STACK_OPTIONS[category].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {assessment ? <StackAssessmentPanel assessment={assessment} /> : null}
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  const res = await saveStackAction(
                    props.projectId,
                    stack as Record<string, string>,
                  );
                  if (res.assessment) setAssessment(res.assessment as StackAssessmentResult);
                  refresh();
                } catch {
                  setError(t("errors.generic"));
                }
              })
            }
          >
            {t("stack.assessAndContinue")}
          </Button>
        </div>
      ) : null}

      {step === "SUMMARY" && props.isLeader ? (
        <div className="dq-card space-y-6 rounded-xl p-6">
          <h2 className="font-semibold">{t("summary.title")}</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--dq-border)] p-4">
              <div className="text-xs text-[var(--muted-foreground)]">{t("summary.mode")}</div>
              <div className="font-medium">{props.mode}</div>
            </div>
            <div className="rounded-lg border border-[var(--dq-border)] p-4">
              <div className="text-xs text-[var(--muted-foreground)]">{t("summary.team")}</div>
              <div className="font-medium">{props.members.length} members</div>
            </div>
          </div>
          {assessment || props.stackAssessment ? (
            <StackAssessmentPanel assessment={(assessment ?? props.stackAssessment)!} />
          ) : null}
          <CoverageIndicators coverage={props.criticalCoverage} />
          <p className="text-xs text-[var(--muted-foreground)]">{t("summary.advisory")}</p>
          <Button
            disabled={pending || !props.criticalCoverage.isComplete}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const res = await launchCampaignAction(props.projectId);
                if (res && !res.ok) setError(t(`errors.${res.error}` as "errors.generic"));
              })
            }
          >
            {t("summary.launch")}
          </Button>
        </div>
      ) : null}

      {step === "ROLE_APPROVAL" && !props.isLeader ? (
        <div className="dq-card rounded-xl p-6 text-sm text-[var(--muted-foreground)]">
          {t("approval.waitingForLeader")}
        </div>
      ) : null}
    </div>
  );
}

function MemberRoleApproval({
  member,
  projectId,
  leaderId,
  mode,
  onDone,
}: {
  member: Member;
  projectId: string;
  leaderId: string;
  mode: "SOLO" | "TEAM";
  onDone: () => void;
}) {
  const t = useTranslations("setup.approval");
  const [roles, setRoles] = useState<TeamRoles>(
    member.approvedRoles.length ? member.approvedRoles : member.preferredRoles,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-[var(--dq-border)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-medium">{member.name || member.email}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {t("preferred")}: {member.preferredRoles.join(", ") || "—"}
          </div>
        </div>
      </div>
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        {TEAM_ROLE_KEYS.map((role) => (
          <RoleCheckbox
            key={role}
            role={role}
            checked={roles.includes(role)}
            onChange={(checked) =>
              setRoles((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
            }
          />
        ))}
      </div>
      {error ? <p className="mb-2 text-sm text-[var(--dq-error)]">{error}</p> : null}
      <Button
        size="sm"
        disabled={pending || roles.length === 0}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              if (member.userId === leaderId && mode === "TEAM") {
                setError(t("cannotSelfApprove"));
                return;
              }
              await approveRolesAction(projectId, member.userId, roles);
              onDone();
            } catch {
              setError(t("error"));
            }
          })
        }
      >
        {t("approve")}
      </Button>
    </div>
  );
}

function CoverageIndicators({ coverage }: { coverage: SetupWizardProps["criticalCoverage"] }) {
  const t = useTranslations("setup.approval");
  const items = [
    { key: "engineering", ok: coverage.engineering },
    { key: "testing", ok: coverage.testing },
    { key: "documentation", ok: coverage.documentation },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className={cn(
            "rounded px-2 py-1 text-xs",
            item.ok
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-[var(--dq-surface-container-high)] text-[var(--muted-foreground)]",
          )}
        >
          {t(`coverage.${item.key}`)}
        </span>
      ))}
    </div>
  );
}

function StackAssessmentPanel({ assessment }: { assessment: StackAssessmentResult }) {
  const t = useTranslations("setup.stack");
  return (
    <div className="space-y-4 rounded-lg border border-[var(--dq-border)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("compatibilityScore")}</span>
        <span className="font-mono text-2xl text-[var(--dq-primary)]">
          {assessment.compatibilityScore}
        </span>
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">{assessment.advisory}</p>
      {assessment.strengths.length > 0 ? (
        <Section title={t("strengths")} items={assessment.strengths} tone="primary" />
      ) : null}
      {assessment.risks.length > 0 ? (
        <Section title={t("risks")} items={assessment.risks} tone="error" />
      ) : null}
      {assessment.missingAreas.length > 0 ? (
        <Section title={t("missing")} items={assessment.missingAreas} tone="muted" />
      ) : null}
      {assessment.recommendations.length > 0 ? (
        <Section title={t("recommendations")} items={assessment.recommendations} tone="secondary" />
      ) : null}
    </div>
  );
}

function Section({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "primary" | "error" | "muted" | "secondary";
}) {
  const color =
    tone === "primary"
      ? "text-[var(--dq-primary)]"
      : tone === "error"
        ? "text-[var(--dq-error)]"
        : tone === "secondary"
          ? "text-[var(--dq-secondary)]"
          : "text-[var(--muted-foreground)]";

  return (
    <div>
      <div className={cn("mb-1 text-xs font-semibold tracking-wide uppercase", color)}>{title}</div>
      <ul className="space-y-1 text-sm text-[var(--foreground)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={color}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
