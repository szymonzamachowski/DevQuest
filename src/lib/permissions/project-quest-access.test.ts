import { describe, expect, it, vi } from "vitest";

import { requireProjectQuest } from "@/lib/permissions/project-quest-access";

vi.mock("@/lib/db", () => ({
  prisma: {
    projectQuest: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";

describe("requireProjectQuest", () => {
  it("returns quest when it belongs to the project", async () => {
    vi.mocked(prisma.projectQuest.findFirst).mockResolvedValue({ id: "quest-1" } as never);
    await expect(requireProjectQuest("project-1", "quest-1")).resolves.toEqual({ id: "quest-1" });
    expect(prisma.projectQuest.findFirst).toHaveBeenCalledWith({
      where: { id: "quest-1", projectId: "project-1" },
      select: { id: true },
    });
  });

  it("throws when quest is outside the project", async () => {
    vi.mocked(prisma.projectQuest.findFirst).mockResolvedValue(null);
    await expect(requireProjectQuest("project-1", "other-quest")).rejects.toThrow(
      "QUEST_NOT_FOUND",
    );
  });
});
