import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PublicProjectView } from "@/features/completion/components/public-project-view";
import { getPublicProject } from "@/features/completion/queries/completion";

export default async function PublicProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicProjectSlug: string }>;
  searchParams: Promise<{ member?: string }>;
}) {
  const { publicProjectSlug } = await params;
  const { member: highlightUserId } = await searchParams;
  const t = await getTranslations("phase5.public");

  const project = await getPublicProject(publicProjectSlug);

  if (!project) {
    const maybeExists = await import("@/lib/db").then(({ prisma }) =>
      prisma.project.findFirst({
        where: { publicSlug: publicProjectSlug },
        select: { isPublic: true, status: true },
      }),
    );

    if (maybeExists && (!maybeExists.isPublic || maybeExists.status !== "COMPLETED")) {
      return (
        <div className="dq-card rounded-xl p-10 text-center">
          <h1 className="font-heading text-2xl">{t("disabledTitle")}</h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("disabledDescription")}</p>
        </div>
      );
    }

    notFound();
  }

  return <PublicProjectView project={project} highlightUserId={highlightUserId} />;
}
