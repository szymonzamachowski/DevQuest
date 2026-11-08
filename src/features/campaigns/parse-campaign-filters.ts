import type { CampaignCatalogFilters } from "@/features/campaigns/queries/campaigns";

/** Server-safe: turns catalog URL search params into typed filters. */
export function parseCampaignFilters(
  searchParams: Record<string, string | string[] | undefined>,
): CampaignCatalogFilters {
  const get = (k: string) => {
    const v = searchParams[k];
    return typeof v === "string" ? v : undefined;
  };

  const difficulty = get("difficulty");
  const duration = get("duration");
  const solo = get("solo");

  return {
    query: get("q"),
    difficulty:
      difficulty === "BEGINNER" || difficulty === "INTERMEDIATE" || difficulty === "ADVANCED"
        ? difficulty
        : "ALL",
    duration:
      duration === "SHORT" || duration === "MEDIUM" || duration === "LONG" ? duration : "ALL",
    supportsSolo: solo === "true" ? true : solo === "false" ? false : "ALL",
  };
}
