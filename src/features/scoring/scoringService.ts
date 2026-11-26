import type { CaseDef } from '@/types/case';
import type { ScoreBreakdown } from '@/types/player';
import {
  SCORE_CULPRIT,
  SCORE_EVIDENCE,
  SCORE_METHOD,
  SCORE_MOTIVE,
  SCORE_NO_HINT_BONUS,
  SCORE_HINT_PENALTY,
} from '@/constants';

export interface AccusationInput {
  culpritId: string;
  motiveId: string;
  methodStepIds: string[];
  evidenceIds: string[];
  hintsUsed: number;
}

export interface ScoreResult {
  breakdown: ScoreBreakdown;
  correctCulprit: boolean;
  correctMotive: boolean;
  correctMethodStepIds: string[];
  wrongMethodStepIds: string[];
  missingMethodStepIds: string[];
  correctEvidenceIds: string[];
  wrongEvidenceIds: string[];
  missingEvidenceIds: string[];
}

export function scoreAccusation(c: CaseDef, input: AccusationInput): ScoreResult {
  const sol = c.solution;

  const correctCulprit = input.culpritId === sol.culpritId;
  const correctMotive = input.motiveId === sol.motiveId;

  const correctSet = new Set(sol.methodStepIds);
  const pickedMethod = new Set(input.methodStepIds);
  const correctMethodStepIds = sol.methodStepIds.filter((id) => pickedMethod.has(id));
  const wrongMethodStepIds = input.methodStepIds.filter((id) => !correctSet.has(id));
  const missingMethodStepIds = sol.methodStepIds.filter((id) => !pickedMethod.has(id));
  const methodRaw =
    (correctMethodStepIds.length - wrongMethodStepIds.length) / sol.methodStepIds.length;
  const method = Math.round(Math.max(0, Math.min(1, methodRaw)) * SCORE_METHOD);

  const decisiveSet = new Set(sol.decisiveEvidenceIds);
  const pickedEvidence = new Set(input.evidenceIds);
  const correctEvidenceIds = sol.decisiveEvidenceIds.filter((id) => pickedEvidence.has(id));
  const wrongEvidenceIds = input.evidenceIds.filter((id) => !decisiveSet.has(id));
  const missingEvidenceIds = sol.decisiveEvidenceIds.filter((id) => !pickedEvidence.has(id));
  const evidenceRaw =
    (correctEvidenceIds.length - wrongEvidenceIds.length) / sol.decisiveEvidenceIds.length;
  const evidence = Math.round(Math.max(0, Math.min(1, evidenceRaw)) * SCORE_EVIDENCE);

  const noHintBonus = Math.max(0, SCORE_NO_HINT_BONUS - input.hintsUsed * SCORE_HINT_PENALTY);

  const breakdown: ScoreBreakdown = {
    culprit: correctCulprit ? SCORE_CULPRIT : 0,
    motive: correctMotive ? SCORE_MOTIVE : 0,
    method,
    evidence,
    noHintBonus,
    total: 0,
  };
  breakdown.total =
    breakdown.culprit + breakdown.motive + breakdown.method + breakdown.evidence + breakdown.noHintBonus;

  return {
    breakdown,
    correctCulprit,
    correctMotive,
    correctMethodStepIds,
    wrongMethodStepIds,
    missingMethodStepIds,
    correctEvidenceIds,
    wrongEvidenceIds,
    missingEvidenceIds,
  };
}
