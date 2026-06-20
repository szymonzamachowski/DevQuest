import { BASE_COMPATIBILITY_SCORE, STACK_RULES } from "@/config/stack-rules";
import type { TechStack } from "@/types/tech-stack";

export type StackAssessmentResult = {
  compatibilityScore: number;
  strengths: string[];
  risks: string[];
  missingAreas: string[];
  recommendations: string[];
  advisory: string;
};

export function assessStack(stack: TechStack): StackAssessmentResult {
  const normalized: Record<string, string | undefined> = { ...stack };
  let score = BASE_COMPATIBILITY_SCORE;

  const strengths: string[] = [];
  const risks: string[] = [];
  const missingAreas: string[] = [];
  const recommendations: string[] = [];

  for (const rule of STACK_RULES) {
    if (!rule.when(normalized)) continue;
    if (rule.scoreDelta) score += rule.scoreDelta;

    switch (rule.type) {
      case "strength":
        strengths.push(rule.message);
        break;
      case "risk":
        risks.push(rule.message);
        break;
      case "missing":
        missingAreas.push(rule.message);
        break;
      case "recommendation":
        recommendations.push(rule.message);
        break;
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    compatibilityScore: score,
    strengths,
    risks,
    missingAreas,
    recommendations,
    advisory:
      "This assessment is advisory only. It does not block campaign launch and does not verify implementation quality.",
  };
}
