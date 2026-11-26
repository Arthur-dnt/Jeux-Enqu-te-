import type { CaseDef } from '@/types/case';
import { caseSchema } from './caseSchema';

export interface ValidationIssue {
  level: 'error' | 'warning';
  message: string;
}

export function validateCaseStructure(raw: unknown): { ok: boolean; issues: ValidationIssue[] } {
  const parsed = caseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => ({
        level: 'error' as const,
        message: `${i.path.join('.') || '(racine)'}: ${i.message}`,
      })),
    };
  }
  return { ok: true, issues: validateCaseCoherence(parsed.data as CaseDef) };
}

export function validateCaseCoherence(c: CaseDef): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const evidenceIds = new Set(c.evidence.map((e) => e.id));
  const sceneIds = new Set(c.scenes.map((s) => s.id));
  const suspectIds = new Set(c.suspects.map((s) => s.id));
  const motiveIds = new Set(c.motives.map((m) => m.id));
  const methodIds = new Set(c.methodSteps.map((m) => m.id));
  const hotspotIds = new Set<string>();

  for (const scene of c.scenes) {
    for (const h of scene.hotspots) {
      if (hotspotIds.has(h.id)) issues.push({ level: 'error', message: `Hotspot dupliqué: ${h.id}` });
      hotspotIds.add(h.id);
      if (h.evidenceId && !evidenceIds.has(h.evidenceId)) {
        issues.push({ level: 'error', message: `Hotspot ${h.id} → preuve inconnue ${h.evidenceId}` });
      }
    }
  }
  for (const e of c.evidence) {
    if (!sceneIds.has(e.sceneId)) {
      issues.push({ level: 'error', message: `Preuve ${e.id} → scène inconnue ${e.sceneId}` });
    }
  }
  for (const s of c.suspects) {
    for (const rid of s.relatedEvidenceIds) {
      if (!evidenceIds.has(rid)) {
        issues.push({ level: 'error', message: `Suspect ${s.id} → preuve inconnue ${rid}` });
      }
    }
  }
  const sol = c.solution;
  if (!suspectIds.has(sol.culpritId)) issues.push({ level: 'error', message: `Coupable inconnu: ${sol.culpritId}` });
  if (!motiveIds.has(sol.motiveId)) issues.push({ level: 'error', message: `Mobile inconnu: ${sol.motiveId}` });
  for (const id of sol.methodStepIds) {
    if (!methodIds.has(id)) issues.push({ level: 'error', message: `Étape de méthode inconnue: ${id}` });
  }
  for (const id of sol.decisiveEvidenceIds) {
    if (!evidenceIds.has(id)) {
      issues.push({ level: 'error', message: `Preuve décisive inconnue: ${id}` });
    } else {
      const ev = c.evidence.find((e) => e.id === id)!;
      const reachable = c.scenes.some((s) => s.hotspots.some((h) => h.evidenceId === id));
      if (!reachable) {
        issues.push({ level: 'error', message: `Preuve décisive ${id} non découvrable dans une scène` });
      }
      if (ev.sceneId !== c.scenes.find((s) => s.hotspots.some((h) => h.evidenceId === id))?.id) {
        issues.push({ level: 'warning', message: `Preuve ${id}: scène déclarée ≠ scène du hotspot` });
      }
    }
  }
  const correctMethodIds = new Set(sol.methodStepIds);
  if (c.methodSteps.every((m) => correctMethodIds.has(m.id))) {
    issues.push({ level: 'warning', message: 'Aucune étape piège dans la méthode (toutes correctes)' });
  }
  if (c.motives.length < 2) issues.push({ level: 'warning', message: 'Moins de deux mobiles proposés' });
  return issues;
}
