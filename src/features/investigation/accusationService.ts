import type { CaseDef } from '@/types/case';
import type { InvestigationSave } from '@/types/save';
import type { ScoreHistoryEntry } from '@/types/player';
import { scoreAccusation, type AccusationInput } from '@/features/scoring/scoringService';
import { xpForScore } from '@/features/progression/progressionService';
import { nowIso } from '@/utils/time';
import { generateId } from '@/utils/id';

export interface AccusationPayload extends AccusationInput {
  kind?: 'standard' | 'daily';
  dayKey?: string | null;
}

export function finalizeAccusation(
  caseData: CaseDef,
  save: InvestigationSave,
  payload: AccusationPayload
): {
  result: ReturnType<typeof scoreAccusation>;
  entry: ScoreHistoryEntry;
  xpGain: number;
} {
  const result = scoreAccusation(caseData, payload);
  const kind = payload.kind ?? 'standard';
  const entry: ScoreHistoryEntry = {
    id: generateId('score'),
    caseId: caseData.id,
    caseNumber: caseData.number,
    caseTitle: caseData.title,
    kind,
    dayKey: kind === 'daily' ? payload.dayKey ?? null : null,
    score: result.breakdown.total,
    breakdown: result.breakdown,
    elapsedSeconds: save.elapsedSeconds,
    hintsUsed: save.hintsUsed,
    createdAt: nowIso(),
  };
  return { result, entry, xpGain: xpForScore(entry.score, caseData.difficulty) };
}
