import Link from "next/link";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CampaignDetailView } from "@/features/campaigns/components/campaign-detail";
import { getCampaignBySlug } from "@/features/campaigns/queries/campaigns";
import { getAuthOptions } from "@/lib/auth";

type Params = Promise<{ campaignSlug: string }>;

export default async function CampaignDetailPage({ params }: { params: Params }) {
  const { campaignSlug } = await params;
  const t = await getTranslations("campaigns.detail");

  const campaign = await getCampaignBySlug(campaignSlug);
  if (!campaign) notFound();

  const session = await getServerSession(getAuthOptions());
  const startHref = session
    ? `/app/campaigns/${campaign.id}/setup`
    : `/login?callbackUrl=${encodeURIComponent(`/app/campaigns/${campaign.id}/setup`)}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="h-9 px-0 text-[var(--muted-foreground)]">
        <Link href="/campaigns">← {t("backToCatalog")}</Link>
      </Button>
      <CampaignDetailView campaign={campaign} startHref={startHref} />
    </div>
  );
}
