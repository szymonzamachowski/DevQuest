import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges classnames", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
