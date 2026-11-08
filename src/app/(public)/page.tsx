import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type LoopStep = { title: string; body: string };

export default function HomePage() {
  const t = useTranslations("home");
  const loop = t.raw("loop") as LoopStep[];

  return (
    <div className="space-y-20 pb-10">
      <section className="grid gap-12 pt-4 lg:grid-cols-12 lg:items-center lg:pt-10">
        <div className="space-y-7 lg:col-span-6">
          <h1 className="text-[clamp(3.5rem,9vw,6rem)] leading-[0.8] text-[var(--dq-gold)] [text-shadow:4px_4px_0_var(--dq-ink),8px_8px_0_rgb(0_0_0/0.35)]">
            DevQuest
          </h1>
          <p className="max-w-[22ch] text-2xl leading-tight font-semibold text-[var(--dq-parchment)] md:text-3xl">
            {t("title")}
          </p>
          <p className="max-w-[52ch] text-lg leading-relaxed text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/login">{t("playDemo")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/campaigns">{t("browseCampaigns")}</Link>
            </Button>
          </div>
          <p className="text-sm text-[var(--dq-outline)]">{t("demoHint")}</p>
        </div>

        <QuestPreview />
      </section>

      <section aria-labelledby="loop-title" className="space-y-8">
        <h2 id="loop-title" className="font-heading text-5xl text-[var(--dq-parchment)]">
          {t("loopTitle")}
        </h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loop.map((step, index) => (
            <li key={step.title} className="dq-card space-y-3 p-5">
              <span
                aria-hidden
                className="inline-flex size-9 items-center justify-center bg-[var(--dq-ink)] text-lg font-bold text-[var(--dq-gold)]"
              >
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold text-[var(--dq-parchment)]">{step.title}</h3>
              <p className="leading-relaxed text-[var(--muted-foreground)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** A static slice of real gameplay: one quest card, the XP it pays, and a client letter. */
function QuestPreview() {
  const t = useTranslations("home.preview");

  return (
    <figure aria-label={t("label")} className="relative space-y-7 lg:col-span-6 lg:pl-6">
      <div className="dq-card space-y-5 p-6">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-[var(--dq-mana)]">{t("chapter")}</span>
          <span className="bg-[var(--dq-ink)] px-2 py-1 text-[var(--dq-ember)]">
            {t("inReview")}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-[var(--dq-parchment)]">{t("questTitle")}</div>
          <div className="text-[var(--muted-foreground)]">{t("questMeta")}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">{t("skill")}</span>
            <span className="dq-xp-pop text-lg font-bold text-[var(--dq-ember)]">
              {t("reward")}
            </span>
          </div>
          <div
            className="dq-meter"
            style={{ "--meter-color": "var(--dq-ember)" } as React.CSSProperties}
          >
            <span className="dq-xp-fill" style={{ "--value": 72 } as React.CSSProperties} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">{t("health")}</span>
            <span className="font-bold text-[var(--dq-moss)]">82/100</span>
          </div>
          <div
            className="dq-meter"
            style={{ "--meter-color": "var(--dq-moss)" } as React.CSSProperties}
          >
            <span style={{ "--value": 82 } as React.CSSProperties} />
          </div>
        </div>
      </div>

      <blockquote className="dq-parchment ml-auto max-w-sm space-y-3 p-5 lg:-mt-2 lg:mr-[-0.5rem] lg:rotate-[-1.5deg]">
        <div className="text-sm font-semibold text-[#7a4a1c]">{t("letterFrom")}</div>
        <p className="text-lg leading-snug">{t("letterBody")}</p>
        <div className="flex gap-3 pt-1 text-sm font-semibold" aria-hidden>
          <span className="bg-[#2b1d14] px-3 py-1.5 text-[var(--dq-parchment)]">{t("accept")}</span>
          <span className="px-3 py-1.5 shadow-[inset_0_0_0_2px_#2b1d14]">{t("pushBack")}</span>
        </div>
      </blockquote>
    </figure>
  );
}
