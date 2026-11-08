"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";

export function CampaignFilters() {
  const t = useTranslations("campaigns.filters");
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "ALL" || !value) next.delete(key);
    else next.set(key, value);
    router.push(`/campaigns?${next.toString()}`);
  }

  return (
    <div className="dq-card flex flex-col gap-4 rounded-xl p-4 lg:flex-row lg:items-center">
      <div className="flex-1">
        <Input
          placeholder={t("searchPlaceholder")}
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => update("q", e.target.value)}
          className="h-11"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          className="h-11 rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-dim)] px-3 text-sm"
          defaultValue={params.get("difficulty") ?? "ALL"}
          onChange={(e) => update("difficulty", e.target.value)}
        >
          <option value="ALL">{t("difficultyAll")}</option>
          <option value="BEGINNER">{t("difficultyBeginner")}</option>
          <option value="INTERMEDIATE">{t("difficultyIntermediate")}</option>
          <option value="ADVANCED">{t("difficultyAdvanced")}</option>
        </select>
        <select
          className="h-11 rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-dim)] px-3 text-sm"
          defaultValue={params.get("duration") ?? "ALL"}
          onChange={(e) => update("duration", e.target.value)}
        >
          <option value="ALL">{t("durationAll")}</option>
          <option value="SHORT">{t("durationShort")}</option>
          <option value="MEDIUM">{t("durationMedium")}</option>
          <option value="LONG">{t("durationLong")}</option>
        </select>
        <select
          className="h-11 rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-dim)] px-3 text-sm"
          defaultValue={params.get("solo") ?? "ALL"}
          onChange={(e) => update("solo", e.target.value)}
        >
          <option value="ALL">{t("modeAll")}</option>
          <option value="true">{t("modeSolo")}</option>
          <option value="false">{t("modeTeam")}</option>
        </select>
      </div>
    </div>
  );
}
