import type { InvestigationSave } from '@/types/save';
import type { CaseDef, EvidenceDef, Hotspot, SceneDef } from '@/types/case';
import { hotspotContains } from '@/utils/geometry';
import type { Point } from '@/utils/geometry';
import { nowIso } from '@/utils/time';

export function findHotspotAtPoint(scene: SceneDef, p: Point): Hotspot | null {
  for (const h of scene.hotspots) {
    if (hotspotContains(h, p)) return h;
  }
  return null;
}

export function applyExamination(
  save: InvestigationSave,
  hotspot: Hotspot,
  evidence: EvidenceDef | undefined
): InvestigationSave {
  const examined = save.examinedHotspotIds.includes(hotspot.id)
    ? save.examinedHotspotIds
    : [...save.examinedHotspotIds, hotspot.id];
  let discovered = save.discoveredEvidenceIds;
  if (evidence && !discovered.includes(evidence.id)) {
    discovered = [...discovered, evidence.id];
  }
  return { ...save, examinedHotspotIds: examined, discoveredEvidenceIds: discovered, updatedAt: nowIso() };
}

export function applyHint(save: InvestigationSave): InvestigationSave {
  return { ...save, hintsUsed: save.hintsUsed + 1, updatedAt: nowIso() };
}

export function isEvidenceDiscovered(save: InvestigationSave, evidenceId: string): boolean {
  return save.discoveredEvidenceIds.includes(evidenceId);
}

export function visibleEvidence(c: CaseDef, save: InvestigationSave): EvidenceDef[] {
  return c.evidence.filter((e) => save.discoveredEvidenceIds.includes(e.id));
}

export function undiscoveredCount(c: CaseDef, save: InvestigationSave): number {
  return c.evidence.length - save.discoveredEvidenceIds.length;
}

export function undiscoveredHotspotsInScene(c: CaseDef, save: InvestigationSave, sceneId: string): Hotspot[] {
  const scene = c.scenes.find((s) => s.id === sceneId);
  if (!scene) return [];
  return scene.hotspots.filter((h) => {
    if (save.examinedHotspotIds.includes(h.id)) return false;
    if (!h.evidenceId) return false;
    return !save.discoveredEvidenceIds.includes(h.evidenceId);
  });
}

export function evidenceCountForScene(c: CaseDef, save: InvestigationSave, sceneId: string): number {
  return c.evidence.filter((e) => e.sceneId === sceneId && save.discoveredEvidenceIds.includes(e.id)).length;
}
