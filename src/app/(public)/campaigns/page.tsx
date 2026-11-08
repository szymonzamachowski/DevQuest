import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import {
  CampaignCatalog,
  CampaignCatalogSkeleton,
} from "@/features/campaigns/components/campaign-catalog";
import { parseCampaignFilters } from "@/features/campaigns/parse-campaign-filters";
import { getPublishedCampaigns } from "@/features/campaigns/queries/campaigns";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CampaignsPage({ searchParams }: { searchParams: SearchParams }) {
  const t = await getTranslations("campaigns");
  const params = await searchParams;
  const filters = parseCampaignFilters(params);

  let campaigns;
  try {
    campaigns = await getPublishedCampaigns(filters);
  } catch {
    return (
      <div className="dq-card p-8 text-center">
        <p className="text-sm text-[var(--dq-error)]">{t("error")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-4xl tracking-[-0.02em] text-[var(--foreground)]">
            {t("catalogTitle")}
          </h1>
          <div className="h-px flex-1 bg-gradient-to-r from-[rgba(173,198,255,0.25)] to-transparent" />
        </div>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          {t("catalogSubtitle")}
        </p>
      </div>

      <Suspense fallback={<CampaignCatalogSkeleton />}>
        <CampaignCatalog campaigns={campaigns} />
      </Suspense>
    </div>
  );
}
