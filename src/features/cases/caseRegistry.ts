import type { CaseDef } from '@/types/case';
import { validateCaseStructure } from './caseValidation';
import case001 from '../../data/cases/case001.json';

function loadCase(raw: unknown): CaseDef {
  const { ok, issues } = validateCaseStructure(raw);
  if (!ok) {
    const detail = issues.map((i) => i.message).join('; ');
    throw new Error(`Données d'enquête invalides: ${detail}`);
  }
  return raw as CaseDef;
}

const registry: CaseDef[] = [loadCase(case001)];

export function getAllCases(): CaseDef[] {
  return registry;
}

export function getCaseById(id: string): CaseDef | undefined {
  return registry.find((c) => c.id === id);
}

export function requireCase(id: string): CaseDef {
  const c = getCaseById(id);
  if (!c) throw new Error(`Enquête introuvable: ${id}`);
  return c;
}

export function getEvidenceById(c: CaseDef, id: string) {
  return c.evidence.find((e) => e.id === id);
}

export function getSceneById(c: CaseDef, id: string) {
  return c.scenes.find((s) => s.id === id);
}

export function getSuspectById(c: CaseDef, id: string) {
  return c.suspects.find((s) => s.id === id);
}
