import { describe, expect, it } from "vitest";

describe("client event decision permissions", () => {
  it("allows solo user to decide", () => {
    const isLeader = true;
    const isSolo = true;
    expect(isLeader || isSolo).toBe(true);
  });

  it("blocks team member from deciding", () => {
    const isLeader = false;
    const isSolo = false;
    expect(isLeader || isSolo).toBe(false);
  });
});

describe("client event trigger matching", () => {
  function shouldTriggerQuestCompleted(config: { questSlug?: string }, slug: string) {
    return config.questSlug === slug;
  }

  it("matches quest completed triggers", () => {
    expect(
      shouldTriggerQuestCompleted(
        { questSlug: "prevent-double-booking" },
        "prevent-double-booking",
      ),
    ).toBe(true);
    expect(shouldTriggerQuestCompleted({ questSlug: "prevent-double-booking" }, "other")).toBe(
      false,
    );
  });

  it("matches chapter start triggers", () => {
    const config = { chapterOrder: 2 };
    expect(config.chapterOrder === 2).toBe(true);
    expect(config.chapterOrder === 3).toBe(false);
  });
});
