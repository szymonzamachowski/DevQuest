import { describe, expect, it } from "vitest";

import { makeTimeShift } from "@/lib/services/demo-sandbox.service";

describe("makeTimeShift", () => {
  it("moves dates so the latest template event lands on now", () => {
    const latest = new Date("2026-01-10T12:00:00Z");
    const now = new Date("2026-03-01T12:00:00Z");
    const shift = makeTimeShift(latest, now);

    expect(shift(latest).toISOString()).toBe(now.toISOString());
    // A deadline 3 days after the last event stays 3 days in the future.
    expect(shift(new Date("2026-01-13T12:00:00Z")).toISOString()).toBe("2026-03-04T12:00:00.000Z");
  });

  it("keeps null dates null", () => {
    const shift = makeTimeShift(new Date(0), new Date(1000));
    expect(shift(null)).toBeNull();
  });
});
