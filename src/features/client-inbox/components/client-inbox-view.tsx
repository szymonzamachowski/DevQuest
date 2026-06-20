"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  addClientEventCommentAction,
  markInboxEventReadAction,
  resolveClientEventAction,
} from "@/features/client-inbox/actions/inbox.actions";
import { cn } from "@/lib/utils";

type InboxEvent = {
  id: string;
  status: string;
  importance: string;
  isRead: boolean;
  triggeredAt: Date;
  responseDeadline: Date | null;
  resultMessage: string | null;
  clientEventTemplate: {
    title: string;
    subject: string;
    message: string;
    options: Array<{
      id: string;
      label: string;
      description: string;
      decisionType: string;
      healthImpact: number;
      xpImpact: number;
    }>;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string | null; email: string };
  }>;
};

export function ClientInboxView({
  projectId,
  events,
  unreadCount,
  isLeader,
  isSolo,
}: {
  projectId: string;
  events: InboxEvent[];
  unreadCount: number;
  isLeader: boolean;
  isSolo: boolean;
}) {
  const t = useTranslations("phase4.inbox");
  const [selectedId, setSelectedId] = useState<string | null>(events[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = events.find((e) => e.id === selectedId) ?? null;
  const canDecide = isLeader || isSolo;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {t("subtitle", { unread: unreadCount })}
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => {
                setSelectedId(event.id);
                if (!event.isRead) {
                  startTransition(() => {
                    void markInboxEventReadAction(projectId, event.id);
                  });
                }
              }}
              className={cn(
                "dq-card w-full rounded-xl p-4 text-left transition-colors",
                selectedId === event.id && "border-[var(--dq-primary)]/50",
                !event.isRead &&
                  event.status === "PENDING" &&
                  "border-l-2 border-l-[var(--dq-primary)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{event.clientEventTemplate.subject}</span>
                <span className="text-[10px] tracking-wide text-[var(--dq-tertiary)] uppercase">
                  {event.importance}
                </span>
              </div>
              <div className="mt-1 text-xs text-[var(--muted-foreground)]">{event.status}</div>
              <div className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                {event.triggeredAt.toLocaleString()}
              </div>
            </button>
          ))}
          {events.length === 0 ? (
            <div className="dq-card rounded-xl p-6 text-sm text-[var(--muted-foreground)]">
              {t("empty")}
            </div>
          ) : null}
        </div>

        {selected ? (
          <div className="dq-card rounded-xl p-6 lg:col-span-3">
            <h2 className="text-xl font-semibold">{selected.clientEventTemplate.subject}</h2>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              {selected.clientEventTemplate.message}
            </p>

            {selected.responseDeadline ? (
              <p className="mt-2 text-xs text-amber-300/90">
                {t("deadline", { date: selected.responseDeadline.toLocaleString() })}
              </p>
            ) : null}

            {selected.status === "PENDING" ? (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-[var(--dq-primary)]">
                  {t("responseOptions")}
                </h3>
                {!canDecide ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {t("leaderOnlyDecision")}
                  </p>
                ) : null}
                {selected.clientEventTemplate.options.map((option) => (
                  <div key={option.id} className="rounded-lg border border-[var(--dq-border)] p-4">
                    <div className="font-medium">{option.label}</div>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {option.description}
                    </p>
                    {canDecide ? (
                      <Button
                        size="sm"
                        className="mt-3"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            setError(null);
                            const res = await resolveClientEventAction(projectId, selected.id, {
                              optionId: option.id,
                            });
                            if (!res.ok) setError(t(`errors.${res.error ?? "generic"}`));
                            else window.location.reload();
                          })
                        }
                      >
                        {t("chooseOption")}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[var(--foreground)]">{selected.resultMessage}</p>
            )}

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-[var(--dq-primary)]">{t("comments")}</h3>
              <ul className="mt-3 space-y-2">
                {selected.comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-[var(--dq-border)] p-3 text-sm"
                  >
                    <div className="font-medium">{c.author.name || c.author.email}</div>
                    <p className="text-[var(--muted-foreground)]">{c.content}</p>
                  </li>
                ))}
              </ul>
              <form
                className="mt-4 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const content = new FormData(e.currentTarget).get("content");
                  if (typeof content !== "string") return;
                  startTransition(async () => {
                    await addClientEventCommentAction(projectId, selected.id, content);
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
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
