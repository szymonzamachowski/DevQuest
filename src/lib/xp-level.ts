/** XP needed per user level. Pure module so client components can show level progress. */
export const XP_PER_LEVEL = 500;

export function calculateUserLevel(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
}

/** Progress inside the current level, 0-100, and XP still needed for the next one. */
export function levelProgress(totalXp: number): { percent: number; xpToNext: number } {
  const into = Math.max(0, totalXp) % XP_PER_LEVEL;
  return { percent: Math.round((into / XP_PER_LEVEL) * 100), xpToNext: XP_PER_LEVEL - into };
}
