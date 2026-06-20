export const INITIAL_PROJECT_HEALTH = 85;

export type HealthBand = {
  key: string;
  label: string;
  min: number;
  max: number;
};

export const HEALTH_BANDS: HealthBand[] = [
  { key: "EXCELLENT", label: "Excellent", min: 85, max: 100 },
  { key: "STABLE", label: "Stable", min: 70, max: 84 },
  { key: "AT_RISK", label: "At Risk", min: 50, max: 69 },
  { key: "CRITICAL", label: "Critical", min: 25, max: 49 },
  { key: "FAILED", label: "Failed", min: 0, max: 24 },
];

export const HEALTH_RULE_KEYS = {
  OVERDUE_QUEST: "OVERDUE_QUEST",
  REJECTED_SUBMISSION: "REJECTED_SUBMISSION",
  UNRESOLVED_CLIENT_EVENT: "UNRESOLVED_CLIENT_EVENT",
  CLIENT_DECISION: "CLIENT_DECISION",
  NO_TESTING_COVERAGE: "NO_TESTING_COVERAGE",
  NO_DOCUMENTATION_COVERAGE: "NO_DOCUMENTATION_COVERAGE",
  UNEVEN_WORKLOAD: "UNEVEN_WORKLOAD",
  QUALITY_QUEST_COMPLETED: "QUALITY_QUEST_COMPLETED",
  CRITICAL_ISSUE_RESOLVED: "CRITICAL_ISSUE_RESOLVED",
  EXPIRED_CLIENT_EVENT: "EXPIRED_CLIENT_EVENT",
} as const;

export type HealthRuleKey = (typeof HEALTH_RULE_KEYS)[keyof typeof HEALTH_RULE_KEYS];

export const HEALTH_RULE_DELTAS: Record<HealthRuleKey, number> = {
  OVERDUE_QUEST: -3,
  REJECTED_SUBMISSION: -5,
  UNRESOLVED_CLIENT_EVENT: -4,
  CLIENT_DECISION: 0,
  NO_TESTING_COVERAGE: -2,
  NO_DOCUMENTATION_COVERAGE: -2,
  UNEVEN_WORKLOAD: -3,
  QUALITY_QUEST_COMPLETED: 4,
  CRITICAL_ISSUE_RESOLVED: 6,
  EXPIRED_CLIENT_EVENT: -6,
};

export function clampHealth(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function getHealthBand(score: number): HealthBand {
  const clamped = clampHealth(score);
  return (
    HEALTH_BANDS.find((band) => clamped >= band.min && clamped <= band.max) ??
    HEALTH_BANDS[HEALTH_BANDS.length - 1]!
  );
}
