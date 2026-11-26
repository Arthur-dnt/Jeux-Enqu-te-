import { validateCaseStructure, validateCaseCoherence } from '@/features/cases/caseValidation';
import { requireCase, getAllCases } from '@/features/cases/caseRegistry';
import case001 from '../src/data/cases/case001.json';

describe('validation du dossier 001', () => {
  it('passe la validation de structure (Zod) sans erreur', () => {
    const { ok, issues } = validateCaseStructure(case001);
    expect(ok).toBe(true);
    expect(issues.filter((i) => i.level === 'error')).toEqual([]);
  });

  it('passe la validation de cohérence sans erreur', () => {
    const issues = validateCaseCoherence(getAllCases()[0]);
    expect(issues.filter((i) => i.level === 'error')).toEqual([]);
  });

  it('contient les 4 scènes, 3 suspects et la solution officielle attendue', () => {
    const c = requireCase('case001');
    expect(c.scenes).toHaveLength(4);
    expect(c.suspects).toHaveLength(3);
    expect(c.solution.culpritId).toBe('suspect_etienne');
    expect(c.solution.motiveId).toBe('mot_financial');
    expect(c.solution.decisiveEvidenceIds.length).toBeGreaterThan(0);
  });

  it('chaque scène possède des hotspots aux coordonnées normalisées (0 à 1)', () => {
    const c = requireCase('case001');
    for (const scene of c.scenes) {
      expect(scene.hotspots.length).toBeGreaterThan(0);
      for (const h of scene.hotspots) {
        if (h.type === 'circle') {
          expect(h.x).toBeGreaterThanOrEqual(0);
          expect(h.x).toBeLessThanOrEqual(1);
          expect(h.y).toBeGreaterThanOrEqual(0);
          expect(h.y).toBeLessThanOrEqual(1);
        } else if (h.type === 'rect') {
          expect(h.x).toBeGreaterThanOrEqual(0);
          expect(h.x + h.width).toBeLessThanOrEqual(1);
        } else {
          for (const [px, py] of h.points) {
            expect(px).toBeGreaterThanOrEqual(0);
            expect(px).toBeLessThanOrEqual(1);
            expect(py).toBeGreaterThanOrEqual(0);
            expect(py).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });

  it('toutes les preuves décisives sont découvrables via un hotspot', () => {
    const c = requireCase('case001');
    const discoverable = new Set<string>();
    for (const scene of c.scenes) {
      for (const h of scene.hotspots) {
        if (h.evidenceId) discoverable.add(h.evidenceId);
      }
    }
    for (const id of c.solution.decisiveEvidenceIds) {
      expect(discoverable.has(id)).toBe(true);
    }
  });
});

describe('rejet des données invalides', () => {
  it('rejette un JSON qui ne respecte pas le schéma', () => {
    const { ok } = validateCaseStructure({ id: 'x' });
    expect(ok).toBe(false);
  });

  it('signale une preuve décisive inconnue', () => {
    const c = requireCase('case001');
    const broken = {
      ...c,
      solution: { ...c.solution, decisiveEvidenceIds: ['preuve_inexistante'] },
    };
    const issues = validateCaseCoherence(broken);
    expect(issues.some((i) => i.level === 'error' && i.message.includes('preuve_inexistante'))).toBe(true);
  });

  it('signale un coupable inconnu', () => {
    const c = requireCase('case001');
    const broken = { ...c, solution: { ...c.solution, culpritId: 'suspect_fantome' } };
    const issues = validateCaseCoherence(broken);
    expect(issues.some((i) => i.level === 'error' && i.message.includes('suspect_fantome'))).toBe(true);
  });

  it('signale un hotspot pointant vers une preuve inconnue', () => {
    const c = requireCase('case001');
    const scenes = c.scenes.map((s, i) =>
      i === 0
        ? {
            ...s,
            hotspots: [
              ...s.hotspots,
              {
                id: 'hot_test',
                label: 'Test',
                type: 'rect' as const,
                x: 0.1,
                y: 0.1,
                width: 0.1,
                height: 0.1,
                evidenceId: 'ev_inconnue',
              },
            ],
          }
        : s
    );
    const issues = validateCaseCoherence({ ...c, scenes });
    expect(issues.some((i) => i.level === 'error' && i.message.includes('ev_inconnue'))).toBe(true);
  });
});
