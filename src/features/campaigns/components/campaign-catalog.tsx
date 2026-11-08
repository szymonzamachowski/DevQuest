import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { CampaignCard } from "@/features/campaigns/components/campaign-card";
import { CampaignFilters } from "@/features/campaigns/components/campaign-filters";
import type { CampaignListItem } from "@/features/campaigns/queries/campaigns";

export function CampaignCatalog({ campaigns }: { campaigns: CampaignListItem[] }) {
  const t = useTranslations("campaigns");

  if (campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <Suspense fallback={null}>
          <CampaignFilters />
        </Suspense>
        <div className="dq-card p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">{t("empty")}</p>
        </div>
      </div>
    );
  }

  const featured = campaigns[0];

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <CampaignFilters />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featured ? <CampaignCard campaign={featured} featured /> : null}
        {campaigns.slice(1).map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
      </div>
    </div>
  );
}

export function CampaignCatalogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="dq-card h-20 animate-pulse" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="dq-card h-72 animate-pulse md:col-span-2" />
        <div className="dq-card h-64 animate-pulse" />
      </div>
    </div>
  );
}
