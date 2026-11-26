import { scoreAccusation } from '@/features/scoring/scoringService';
import { requireCase } from '@/features/cases/caseRegistry';

const case001 = requireCase('case001');

describe('scoringService — scoreAccusation', () => {
  const solution = case001.solution;

  it('attribue 1000 points pour une accusation parfaite sans aide', () => {
    const result = scoreAccusation(case001, {
      culpritId: solution.culpritId,
      motiveId: solution.motiveId,
      methodStepIds: solution.methodStepIds,
      evidenceIds: solution.decisiveEvidenceIds,
      hintsUsed: 0,
    });
    expect(result.breakdown).toEqual({
      culprit: 400,
      motive: 200,
      method: 200,
      evidence: 150,
      noHintBonus: 50,
      total: 1000,
    });
    expect(result.correctCulprit).toBe(true);
    expect(result.correctMotive).toBe(true);
    expect(result.wrongMethodStepIds).toEqual([]);
    expect(result.wrongEvidenceIds).toEqual([]);
    expect(result.missingMethodStepIds).toEqual([]);
    expect(result.missingEvidenceIds).toEqual([]);
  });

  it('attribue 0 point aux quatre critères pour une accusation totalement erronée', () => {
    const wrongSuspect = case001.suspects.find((s) => s.id !== solution.culpritId)!;
    const wrongMotive = case001.motives.find((m) => m.id !== solution.motiveId)!;
    const result = scoreAccusation(case001, {
      culpritId: wrongSuspect.id,
      motiveId: wrongMotive.id,
      methodStepIds: [],
      evidenceIds: [],
      hintsUsed: 0,
    });
    expect(result.breakdown.culprit).toBe(0);
    expect(result.breakdown.motive).toBe(0);
    expect(result.breakdown.method).toBe(0);
    expect(result.breakdown.evidence).toBe(0);
    expect(result.correctCulprit).toBe(false);
    expect(result.correctMotive).toBe(false);
    expect(result.breakdown.total).toBe(result.breakdown.noHintBonus);
  });

  it('pénalise les preuves et étapes sélectionnées à tort', () => {
    const decoyStep = case001.methodSteps.find((m) => !solution.methodStepIds.includes(m.id))!;
    const wrongEvidence = case001.evidence.find((e) => !solution.decisiveEvidenceIds.includes(e.id))!;
    const result = scoreAccusation(case001, {
      culpritId: solution.culpritId,
      motiveId: solution.motiveId,
      methodStepIds: [...solution.methodStepIds, decoyStep.id],
      evidenceIds: [...solution.decisiveEvidenceIds, wrongEvidence.id],
      hintsUsed: 0,
    });
    expect(result.wrongMethodStepIds).toEqual([decoyStep.id]);
    expect(result.wrongEvidenceIds).toEqual([wrongEvidence.id]);
    expect(result.breakdown.method).toBeLessThan(200);
    expect(result.breakdown.evidence).toBeLessThan(150);
    expect(result.breakdown.culprit).toBe(400);
  });

  it('réduit le bonus sans aide de 25 points par indice utilisé, sans jamais devenir négatif', () => {
    const base = {
      culpritId: solution.culpritId,
      motiveId: solution.motiveId,
      methodStepIds: [],
      evidenceIds: [],
    };
    expect(scoreAccusation(case001, { ...base, hintsUsed: 1 }).breakdown.noHintBonus).toBe(25);
    expect(scoreAccusation(case001, { ...base, hintsUsed: 2 }).breakdown.noHintBonus).toBe(0);
    expect(scoreAccusation(case001, { ...base, hintsUsed: 7 }).breakdown.noHintBonus).toBe(0);
  });

  it('ne dépasse jamais 1000 points', () => {
    const result = scoreAccusation(case001, {
      culpritId: solution.culpritId,
      motiveId: solution.motiveId,
      methodStepIds: solution.methodStepIds,
      evidenceIds: solution.decisiveEvidenceIds,
      hintsUsed: 0,
    });
    expect(result.breakdown.total).toBeLessThanOrEqual(1000);
  });
});
