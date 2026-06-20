import { useLocale, useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="font-heading text-4xl tracking-[-0.02em] text-[var(--foreground)]">
          {t("pages.settingsTitle")}
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(173,198,255,0.25)] to-transparent" />
      </div>

      <div className="dq-card rounded-xl p-6">
        <div className="text-sm text-[var(--muted-foreground)]">Language</div>
        <div className="mt-3">
          <LocaleSwitcher value={locale === "pl" ? "pl" : "en"} />
        </div>
      </div>
    </div>
  );
}
