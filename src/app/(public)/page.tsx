import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
      <section className="lg:col-span-7">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--dq-border)] bg-[var(--dq-surface-container-low)] px-3 py-1 text-xs text-[var(--dq-outline)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--dq-primary)]" />
            <span className="font-mono tracking-wide">MVP • Phase 1 Foundation</span>
          </div>
          <h1 className="font-heading text-4xl leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] md:text-5xl">
            {t("pages.homeTitle")}
          </h1>
          <p className="max-w-xl text-base leading-7 text-[var(--muted-foreground)] md:text-lg">
            {t("pages.homeSubtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 px-6">
              <Link href="/campaigns">{t("pages.campaignsTitle")}</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-6">
              <Link href="/login">{t("auth.loginTitle")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="lg:col-span-5">
        <div className="dq-card dq-hover-glow rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-semibold tracking-widest text-[var(--dq-primary)]">
                DESIGN SYSTEM
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                Dark premium UI • thin borders • restrained gradients
              </div>
            </div>
            <div className="rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-container-high)] px-3 py-2 text-xs text-[var(--dq-primary)]">
              Tokens
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-container)] px-4 py-3">
              <span className="text-sm text-[var(--foreground)]">Primary</span>
              <span className="font-mono text-xs text-[var(--dq-primary)]">#ADC6FF</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-container)] px-4 py-3">
              <span className="text-sm text-[var(--foreground)]">Secondary</span>
              <span className="font-mono text-xs text-[var(--dq-secondary)]">#D0BCFF</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--dq-border)] bg-[var(--dq-surface-container)] px-4 py-3">
              <span className="text-sm text-[var(--foreground)]">Border</span>
              <span className="font-mono text-xs text-[var(--dq-outline)]">#1E293B</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
