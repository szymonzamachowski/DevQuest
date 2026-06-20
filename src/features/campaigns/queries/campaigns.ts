import { CampaignStatus, type CampaignDifficulty, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type CampaignCatalogFilters = {
  difficulty?: CampaignDifficulty | "ALL";
  duration?: "ALL" | "SHORT" | "MEDIUM" | "LONG";
  supportsSolo?: boolean | "ALL";
  query?: string;
};

export type CampaignListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: CampaignDifficulty;
  estimatedDuration: string;
  minimumTeamSize: number;
  maximumTeamSize: number;
  supportsSolo: boolean;
  coverImage: string | null;
  skillKeys: string[];
  chapterCount: number;
  questCount: number;
};

function parseSkillKeys(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function matchesDuration(
  estimatedDuration: string,
  filter: CampaignCatalogFilters["duration"],
): boolean {
  if (!filter || filter === "ALL") return true;
  const lower = estimatedDuration.toLowerCase();
  if (filter === "SHORT") return lower.includes("1") || lower.includes("2");
  if (filter === "MEDIUM") return lower.includes("2") || lower.includes("4");
  if (filter === "LONG")
    return lower.includes("month") || lower.includes("6") || lower.includes("8");
  return true;
}

export async function getPublishedCampaigns(
  filters: CampaignCatalogFilters = {},
): Promise<CampaignListItem[]> {
  const campaigns = await prisma.campaignTemplate.findMany({
    where: { status: CampaignStatus.PUBLISHED },
    include: {
      chapters: {
        include: { _count: { select: { quests: true } } },
      },
    },
    orderBy: { title: "asc" },
  });

  return campaigns
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      difficulty: c.difficulty,
      estimatedDuration: c.estimatedDuration,
      minimumTeamSize: c.minimumTeamSize,
      maximumTeamSize: c.maximumTeamSize,
      supportsSolo: c.supportsSolo,
      coverImage: c.coverImage,
      skillKeys: parseSkillKeys(c.skillKeys),
      chapterCount: c.chapters.length,
      questCount: c.chapters.reduce((sum, ch) => sum + ch._count.quests, 0),
    }))
    .filter((c) => {
      if (
        filters.difficulty &&
        filters.difficulty !== "ALL" &&
        c.difficulty !== filters.difficulty
      ) {
        return false;
      }
      if (filters.supportsSolo !== undefined && filters.supportsSolo !== "ALL") {
        if (c.supportsSolo !== filters.supportsSolo) return false;
      }
      if (!matchesDuration(c.estimatedDuration, filters.duration)) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const hay = `${c.title} ${c.description} ${c.skillKeys.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
}

export async function getCampaignBySlug(slug: string) {
  const campaign = await prisma.campaignTemplate.findFirst({
    where: { slug, status: CampaignStatus.PUBLISHED },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { quests: true } },
          quests: {
            select: { isRequired: true, isMainQuest: true, baseXp: true, estimatedMinutes: true },
          },
        },
      },
    },
  });

  if (!campaign) return null;

  const skillKeys = parseSkillKeys(campaign.skillKeys);
  const prerequisites = Array.isArray(campaign.prerequisites)
    ? campaign.prerequisites.filter((p): p is string => typeof p === "string")
    : [];

  const allQuests = campaign.chapters.flatMap((ch) => ch.quests);
  const stats = {
    chapterCount: campaign.chapters.length,
    questCount: allQuests.length,
    requiredQuestCount: allQuests.filter((q) => q.isRequired).length,
    totalXp: allQuests.reduce((s, q) => s + q.baseXp, 0),
    estimatedHours: Math.round(allQuests.reduce((s, q) => s + q.estimatedMinutes, 0) / 60),
  };

  return {
    ...campaign,
    skillKeys,
    prerequisites,
    stats,
    chapters: campaign.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      order: ch.order,
      description: ch.description,
      questCount: ch._count.quests,
    })),
  };
}

export async function getCampaignById(id: string) {
  const campaign = await prisma.campaignTemplate.findUnique({
    where: { id },
    include: {
      chapters: { orderBy: { order: "asc" } },
    },
  });
  if (!campaign || campaign.status !== CampaignStatus.PUBLISHED) return null;
  return campaign;
}

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      members: { some: { userId } },
      status: { in: ["SETUP", "ACTIVE"] },
    },
    include: {
      campaignTemplate: { select: { title: true, slug: true, coverImage: true } },
      members: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}
