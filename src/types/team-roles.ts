export const TEAM_ROLE_KEYS = [
  "frontend",
  "backend",
  "fullstack",
  "database",
  "testing",
  "documentation",
  "devops",
  "ux_ui",
] as const;

export type TeamRoleKey = (typeof TEAM_ROLE_KEYS)[number];

/** At least one of frontend/backend/fullstack plus testing and documentation must be covered. */
export const CRITICAL_ROLE_GROUPS = {
  engineering: ["frontend", "backend", "fullstack"] as const,
  testing: ["testing"] as const,
  documentation: ["documentation"] as const,
} as const;

export type TeamRoles = TeamRoleKey[];

export function parseTeamRoles(value: unknown): TeamRoles {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (r): r is TeamRoleKey =>
      typeof r === "string" && (TEAM_ROLE_KEYS as readonly string[]).includes(r),
  );
}

export function hasEngineeringCoverage(roles: TeamRoles): boolean {
  return CRITICAL_ROLE_GROUPS.engineering.some((r) => roles.includes(r));
}

export function hasTestingCoverage(roles: TeamRoles): boolean {
  return roles.includes("testing");
}

export function hasDocumentationCoverage(roles: TeamRoles): boolean {
  return roles.includes("documentation");
}

export type CriticalCoverageResult = {
  engineering: boolean;
  testing: boolean;
  documentation: boolean;
  isComplete: boolean;
  missing: string[];
};

export function evaluateCriticalCoverage(approvedByMember: TeamRoles[]): CriticalCoverageResult {
  const allRoles = approvedByMember.flat();
  const engineering = hasEngineeringCoverage(allRoles);
  const testing = hasTestingCoverage(allRoles);
  const documentation = hasDocumentationCoverage(allRoles);
  const missing: string[] = [];
  if (!engineering) missing.push("engineering");
  if (!testing) missing.push("testing");
  if (!documentation) missing.push("documentation");
  return {
    engineering,
    testing,
    documentation,
    isComplete: engineering && testing && documentation,
    missing,
  };
}

export const SOLO_APPROVED_ROLES: TeamRoles = [
  "fullstack",
  "database",
  "testing",
  "documentation",
  "devops",
];
