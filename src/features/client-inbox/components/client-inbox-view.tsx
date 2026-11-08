"use client";

import { useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";

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
  const format = useFormatter();
  const [selectedId, setSelectedId] = useState<string | null>(events[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = events.find((e) => e.id === selectedId) ?? null;
  const canDecide = isLeader || isSolo;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-5xl leading-none text-[var(--dq-parchment)]">{t("title")}</h1>
        <p className="text-[var(--muted-foreground)]">{t("subtitle", { unread: unreadCount })}</p>
      </div>

      {error ? (
        <div role="alert" className="dq-card px-4 py-3 text-[var(--dq-blood)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-5">
        <ul className="space-y-3 lg:col-span-2">
          {events.map((event) => {
            const sealed = !event.isRead && event.status === "PENDING";
            const active = selectedId === event.id;
            return (
              <li key={event.id}>
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    setSelectedId(event.id);
                    if (!event.isRead) {
                      startTransition(() => {
                        void markInboxEventReadAction(projectId, event.id);
                      });
                    }
                  }}
                  className={cn(
                    "flex w-full gap-4 p-4 text-left",
                    active
                      ? "dq-card dq-card--quest"
                      : "dq-card hover:bg-[var(--dq-surface-container-high)]",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1 size-4 shrink-0",
                      sealed
                        ? "bg-[var(--dq-blood)] shadow-[0_0_0_3px_var(--dq-ink)]"
                        : "bg-[var(--dq-surface-container-highest)]",
                    )}
                  />
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block text-lg leading-tight text-[var(--dq-parchment)]">
                      {event.clientEventTemplate.subject}
                    </span>
                    <span className="flex flex-wrap gap-x-3 text-sm">
                      <span className={statusTone[event.status]}>
                        {t(`status.${event.status}`)}
                      </span>
                      <span className={importanceTone[event.importance]}>
                        {t(`importance.${event.importance}`)}
                      </span>
                      <time
                        dateTime={event.triggeredAt.toISOString()}
                        className="text-[var(--dq-outline)]"
                      >
                        {format.dateTime(event.triggeredAt, "dateTime")}
                      </time>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {events.length === 0 ? (
            <li className="dq-card p-6 text-[var(--muted-foreground)]">{t("empty")}</li>
          ) : null}
        </ul>

        {selected ? (
          <div className="space-y-8 lg:col-span-3">
            <article className="dq-parchment space-y-4 p-6 md:p-8">
              <div className="text-[#7a4a1c]">{t("from")}</div>
              <h2 className="font-heading text-3xl leading-tight md:text-4xl">
                {selected.clientEventTemplate.subject}
              </h2>
              <p className="text-lg leading-relaxed">{selected.clientEventTemplate.message}</p>
              {selected.responseDeadline ? (
                <p className="text-[#9a3412]">
                  {t("deadline", { date: format.dateTime(selected.responseDeadline, "dateTime") })}
                </p>
              ) : null}
            </article>

            {selected.status === "PENDING" ? (
              <section className="space-y-4">
                <h3 className="text-xl text-[var(--dq-gold)]">{t("responseOptions")}</h3>
                {!canDecide ? (
                  <p className="text-[var(--muted-foreground)]">{t("leaderOnlyDecision")}</p>
                ) : null}
                <ul className="grid gap-5 md:grid-cols-2">
                  {selected.clientEventTemplate.options.map((option) => (
                    <li key={option.id} className="dq-card flex flex-col gap-3 p-5">
                      <div className="text-lg leading-tight text-[var(--dq-parchment)]">
                        {option.label}
                      </div>
                      <p className="flex-1 text-[var(--muted-foreground)]">{option.description}</p>
                      <div className="flex gap-4">
                        <Impact
                          value={option.healthImpact}
                          label={t("healthImpact", { value: signed(option.healthImpact) })}
                        />
                        <Impact
                          value={option.xpImpact}
                          label={t("xpImpact", { value: signed(option.xpImpact) })}
                        />
                      </div>
                      {canDecide ? (
                        <Button
                          className="self-start"
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
                    </li>
                  ))}
                </ul>
              </section>
            ) : selected.resultMessage ? (
              <section className="dq-card space-y-2 p-5">
                <h3 className="text-[var(--dq-moss)]">{t("outcome")}</h3>
                <p>{selected.resultMessage}</p>
              </section>
            ) : null}

            <section className="dq-card space-y-4 p-5">
              <h3 className="text-lg text-[var(--dq-mana)]">{t("comments")}</h3>
              {selected.comments.length > 0 ? (
                <ul className="space-y-3">
                  {selected.comments.map((c) => (
                    <li key={c.id} className="bg-[var(--dq-surface-container-lowest)] p-3">
                      <div className="text-[var(--dq-mana)]">{c.author.name || c.author.email}</div>
                      <p>{c.content}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              <form
                className="space-y-4"
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
                  aria-label={t("commentPlaceholder")}
                  className="min-h-24 w-full px-3 py-2"
                  placeholder={t("commentPlaceholder")}
                />
                <Button type="submit" variant="outline" disabled={pending}>
                  {t("addComment")}
                </Button>
              </form>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const statusTone: Record<string, string> = {
  PENDING: "text-[var(--dq-gold)]",
  RESOLVED: "text-[var(--dq-moss)]",
  EXPIRED: "text-[var(--dq-outline)]",
};

const importanceTone: Record<string, string> = {
  LOW: "text-[var(--dq-outline)]",
  NORMAL: "text-[var(--muted-foreground)]",
  HIGH: "text-[var(--dq-ember)]",
  CRITICAL: "text-[var(--dq-blood)]",
};

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

/** Consequence chip shown before the leader commits to an option. */
function Impact({ value, label }: { value: number; label: string }) {
  if (value === 0) return null;
  return (
    <span
      className={cn(
        "bg-[var(--dq-ink)] px-2",
        value > 0 ? "text-[var(--dq-moss)]" : "text-[var(--dq-blood)]",
      )}
    >
      {label}
    </span>
  );
}
