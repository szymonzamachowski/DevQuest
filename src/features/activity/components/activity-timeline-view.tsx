"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ActivityType } from "@prisma/client";

import { ACTIVITY_CATEGORIES } from "@/features/activity/queries/activities";

type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: Date;
  user: { id: string; name: string | null; email: string } | null;
};

export function ActivityTimelineView({
  projectId,
  activities,
  members,
  filters,
}: {
  projectId: string;
  activities: ActivityItem[];
  members: Array<{ userId: string; name: string | null; email: string }>;
  filters: { userId?: string; category?: string; type?: string };
}) {
  const t = useTranslations("phase4.activity");
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/app/projects/${projectId}/activity?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border border-[var(--dq-border)] bg-[var(--dq-surface-container-high)] px-3 py-2 text-sm"
          value={filters.userId ?? ""}
          onChange={(e) => updateFilter("userId", e.target.value)}
        >
          <option value="">{t("allUsers")}</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name || m.email}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border border-[var(--dq-border)] bg-[var(--dq-surface-container-high)] px-3 py-2 text-sm"
          value={filters.category ?? ""}
          onChange={(e) => updateFilter("category", e.target.value)}
        >
          <option value="">{t("allCategories")}</option>
          {Object.keys(ACTIVITY_CATEGORIES).map((key) => (
            <option key={key} value={key}>
              {t(`categories.${key}`)}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-3">
        {activities.map((a) => (
          <li key={a.id} className="dq-card rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium text-[var(--foreground)]">{a.title}</div>
              <span className="text-[10px] tracking-wide text-[var(--dq-tertiary)] uppercase">
                {a.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{a.description}</p>
            <div className="mt-2 text-xs text-[var(--muted-foreground)]">
              {a.user?.name || a.user?.email || "System"} · {a.createdAt.toLocaleString()}
            </div>
          </li>
        ))}
        {activities.length === 0 ? (
          <li className="dq-card rounded-xl p-6 text-sm text-[var(--muted-foreground)]">
            {t("empty")}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
