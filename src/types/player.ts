export interface PlayerProfile {
  id: string;
  pseudo: string;
  xp: number;
  createdAt: string;
  updatedAt: string;
}

export interface RankDef {
  id: string;
  name: string;
  minXp: number;
}

export interface ScoreHistoryEntry {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  kind: 'standard' | 'daily';
  dayKey: string | null;
  score: number;
  breakdown: ScoreBreakdown;
  elapsedSeconds: number;
  hintsUsed: number;
  createdAt: string;
}

export interface ScoreBreakdown {
  culprit: number;
  motive: number;
  method: number;
  evidence: number;
  noHintBonus: number;
  total: number;
}

export interface CasePerformance {
  bestScore: number;
  bestTimeSeconds: number;
  plays: number;
}
