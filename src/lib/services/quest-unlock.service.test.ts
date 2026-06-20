import { ProjectQuestStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  areDependenciesSatisfied,
  computeSuggestedDeadline,
} from "@/lib/services/quest-unlock.service";

describe("areDependenciesSatisfied", () => {
  const makeQuest = (
    id: string,
    status: ProjectQuestStatus,
    deps: Array<{ dependsOnId: string; isRequired: boolean }>,
  ) => ({
    id,
    questTemplateId: id,
    status,
    questTemplate: {
      dependencies: deps.map((d) => ({
        dependsOnQuestTemplateId: d.dependsOnId,
        dependsOnQuestTemplate: {
          id: d.dependsOnId,
          isRequired: d.isRequired,
          slug: d.dependsOnId,
          title: d.dependsOnId,
        },
      })),
    },
  });

  it("unlocks when there are no dependencies", () => {
    const quest = makeQuest("q1", ProjectQuestStatus.LOCKED, []);
    const map = new Map([[quest.questTemplateId, quest]]);
    expect(areDependenciesSatisfied(quest, map)).toBe(true);
  });

  it("blocks when a required dependency is incomplete", () => {
    const dep = makeQuest("dep", ProjectQuestStatus.AVAILABLE, []);
    const quest = makeQuest("q2", ProjectQuestStatus.LOCKED, [
      { dependsOnId: "dep", isRequired: true },
    ]);
    const map = new Map([
      [dep.questTemplateId, dep],
      [quest.questTemplateId, quest],
    ]);
    expect(areDependenciesSatisfied(quest, map)).toBe(false);
  });

  it("allows optional dependencies to remain incomplete", () => {
    const dep = makeQuest("opt", ProjectQuestStatus.AVAILABLE, []);
    const quest = makeQuest("q3", ProjectQuestStatus.LOCKED, [
      { dependsOnId: "opt", isRequired: false },
    ]);
    const map = new Map([
      [dep.questTemplateId, dep],
      [quest.questTemplateId, quest],
    ]);
    expect(areDependenciesSatisfied(quest, map)).toBe(true);
  });
});

describe("computeSuggestedDeadline", () => {
  it("adds estimated minutes to unlock time", () => {
    const start = new Date("2026-01-01T10:00:00Z");
    const deadline = computeSuggestedDeadline(start, 120);
    expect(deadline.toISOString()).toBe("2026-01-01T12:00:00.000Z");
  });
});
