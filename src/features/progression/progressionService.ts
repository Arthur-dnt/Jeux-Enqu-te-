import type { CasePerformance, RankDef } from '@/types/player';

export const RANKS: RankDef[] = [
  { id: 'trainee', name: 'Stagiaire', minXp: 0 },
  { id: 'investigator', name: 'Enquêteur', minXp: 150 },
  { id: 'inspector', name: 'Inspecteur', minXp: 400 },
  { id: 'detective', name: 'Détective', minXp: 800 },
  { id: 'chief', name: 'Inspecteur principal', minXp: 1400 },
  { id: 'commissioner', name: 'Commissaire', minXp: 2200 },
];

export function getRank(xp: number): RankDef {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) current = r;
  }
  return current;
}

export function getNextRank(xp: number): RankDef | null {
  return RANKS.find((r) => r.minXp > xp) ?? null;
}

export function getRankProgress(xp: number): { rank: RankDef; next: RankDef | null; ratio: number } {
  const rank = getRank(xp);
  const next = getNextRank(xp);
  if (!next) return { rank, next: null, ratio: 1 };
  const span = next.minXp - rank.minXp;
  const ratio = Math.max(0, Math.min(1, (xp - rank.minXp) / span));
  return { rank, next, ratio };
}

export function xpForScore(score: number, difficulty: number): number {
  return Math.round(score / 10 + difficulty * 5);
}

export function aggregatePerformance(entries: { score: number; elapsedSeconds: number }[]): CasePerformance {
  const plays = entries.length;
  if (plays === 0) return { bestScore: 0, bestTimeSeconds: 0, plays: 0 };
  const bestScore = entries.reduce((a, e) => Math.max(a, e.score), 0);
  const bestTimeSeconds = entries
    .filter((e) => e.score === bestScore)
    .reduce((a, e) => Math.min(a === 0 ? e.elapsedSeconds : a, e.elapsedSeconds), 0);
  return { bestScore, bestTimeSeconds, plays };
}
