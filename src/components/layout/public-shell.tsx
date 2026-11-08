import Link from "next/link";
import { useTranslations } from "next-intl";

import { BrandLogo } from "@/components/brand/brand-logo";
import { LocaleSwitcherServer } from "@/components/i18n/locale-switcher.server";
import { Button } from "@/components/ui/button";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 bg-[var(--dq-surface-dim)] shadow-[0_3px_0_var(--dq-ink),0_6px_0_rgb(0_0_0/0.3)]">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
          <BrandLogo />
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden items-center gap-2 md:flex" aria-label="Public navigation">
              <Button asChild variant="ghost" className="h-9">
                <Link href="/campaigns">{t("pages.campaignsTitle")}</Link>
              </Button>
            </nav>
            <LocaleSwitcherServer />
            <Button asChild className="h-9">
              <Link href="/login">{t("auth.loginTitle")}</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
