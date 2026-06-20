import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { requireAuth } from "@/lib/require-auth";
import { getUserProjects } from "@/features/campaigns/queries/campaigns";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AppCampaignsPage() {
  const session = await requireAuth();
  const t = await getTranslations("campaigns.app");

  let projects;
  try {
    projects = await getUserProjects(session.user.id);
  } catch {
    return (
      <div className="dq-card rounded-xl p-8 text-center">
        <p className="text-sm text-[var(--dq-error)]">{t("error")}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <div className="dq-card rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">{t("empty")}</p>
          <Button asChild className="mt-4">
            <Link href="/campaigns">{t("browse")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="dq-card dq-hover-glow rounded-xl p-6">
            <div className="mb-2 text-xs font-semibold tracking-widest text-[var(--dq-primary)] uppercase">
              {project.status}
            </div>
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {project.campaignTemplate.title}
            </p>
            <div className="mt-4 flex gap-2">
              {project.status === "SETUP" ? (
                <Button asChild size="sm">
                  <Link href={`/app/campaigns/${project.campaignTemplateId}/setup`}>
                    {t("continueSetup")}
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/app/projects/${project.id}`}>{t("openWorkspace")}</Link>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <h1 className="font-heading text-4xl tracking-[-0.02em] text-[var(--foreground)]">
          {title}
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(173,198,255,0.25)] to-transparent" />
      </div>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
    </div>
  );
}
