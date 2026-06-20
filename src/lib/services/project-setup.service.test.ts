import { describe, expect, it } from "vitest";

import { getNextSetupStep } from "@/lib/services/project-setup.service";
import { SetupStep } from "@prisma/client";

describe("getNextSetupStep", () => {
  it("follows solo flow without team approval", () => {
    expect(getNextSetupStep(SetupStep.MODE, "SOLO")).toBe(SetupStep.ROLES);
    expect(getNextSetupStep(SetupStep.ROLES, "SOLO")).toBe(SetupStep.STACK);
    expect(getNextSetupStep(SetupStep.STACK, "SOLO")).toBe(SetupStep.SUMMARY);
  });

  it("follows team flow with role approval", () => {
    expect(getNextSetupStep(SetupStep.MODE, "TEAM")).toBe(SetupStep.TEAM);
    expect(getNextSetupStep(SetupStep.TEAM, "TEAM")).toBe(SetupStep.ROLES);
    expect(getNextSetupStep(SetupStep.ROLES, "TEAM")).toBe(SetupStep.ROLE_APPROVAL);
    expect(getNextSetupStep(SetupStep.ROLE_APPROVAL, "TEAM")).toBe(SetupStep.STACK);
  });
});
