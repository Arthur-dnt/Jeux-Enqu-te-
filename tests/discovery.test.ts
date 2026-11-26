import {
  findHotspotAtPoint,
  applyExamination,
  applyHint,
  visibleEvidence,
  undiscoveredHotspotsInScene,
  evidenceCountForScene,
} from '@/features/investigation/discoveryService';
import { hotspotContains } from '@/utils/geometry';
import { requireCase } from '@/features/cases/caseRegistry';
import type { InvestigationSave } from '@/types/save';

const case001 = requireCase('case001');

function freshSave(): InvestigationSave {
  return {
    caseId: case001.id,
    status: 'active',
    currentSceneId: case001.scenes[0].id,
    visitedScenes: [case001.scenes[0].id],
    discoveredEvidenceIds: [],
    examinedHotspotIds: [],
    sceneViews: {},
    hintsUsed: 0,
    elapsedSeconds: 0,
    startedAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    nodes: [],
    connections: [],
    boardView: { scale: 1, translateX: 0, translateY: 0 },
    suspectHypotheses: {},
    lastResult: null,
  };
}

describe('détection des hotspots', () => {
  it('détecte un point dans un hotspot circulaire', () => {
    const h = { id: 'h1', label: '', type: 'circle' as const, x: 0.5, y: 0.5, r: 0.1 };
    expect(hotspotContains(h, { x: 0.52, y: 0.51 })).toBe(true);
    expect(hotspotContains(h, { x: 0.8, y: 0.8 })).toBe(false);
  });

  it('détecte un point dans un hotspot rectangulaire', () => {
    const h = { id: 'h2', label: '', type: 'rect' as const, x: 0.2, y: 0.3, width: 0.2, height: 0.1 };
    expect(hotspotContains(h, { x: 0.3, y: 0.35 })).toBe(true);
    expect(hotspotContains(h, { x: 0.3, y: 0.5 })).toBe(false);
  });

  it('détecte un point dans un hotspot polygonal (ray-casting)', () => {
    const h = {
      id: 'h3',
      label: '',
      type: 'polygon' as const,
      points: [
        [0.1, 0.1],
        [0.5, 0.1],
        [0.5, 0.5],
        [0.1, 0.5],
      ] as [number, number][],
    };
    expect(hotspotContains(h, { x: 0.3, y: 0.3 })).toBe(true);
    expect(hotspotContains(h, { x: 0.7, y: 0.3 })).toBe(false);
    expect(hotspotContains(h, { x: 0.09, y: 0.3 })).toBe(false);
  });

  it('findHotspotAtPoint renvoie le hotspot correspondant ou null', () => {
    const scene = case001.scenes[0];
    const h = scene.hotspots[0];
    const center = h.type === 'circle' ? { x: h.x, y: h.y } : { x: 0.5, y: 0.5 };
    const hit = findHotspotAtPoint(scene, center);
    expect(hit).not.toBeNull();
    expect(findHotspotAtPoint(scene, { x: -5, y: -5 })).toBeNull();
  });
});

describe('découverte des indices', () => {
  it('applyExamination enregistre le hotspot examiné et découvre la preuve liée', () => {
    const scene = case001.scenes[0];
    const hotspot = scene.hotspots.find((h) => h.evidenceId)!;
    const save = applyExamination(freshSave(), hotspot, case001.evidence.find((e) => e.id === hotspot.evidenceId));
    expect(save.examinedHotspotIds).toContain(hotspot.id);
    expect(save.discoveredEvidenceIds).toContain(hotspot.evidenceId);
  });

  it('applyExamination est idempotent (pas de doublon)', () => {
    const scene = case001.scenes[0];
    const hotspot = scene.hotspots.find((h) => h.evidenceId)!;
    const once = applyExamination(freshSave(), hotspot, undefined);
    const twice = applyExamination(once, hotspot, undefined);
    expect(twice.examinedHotspotIds.filter((id) => id === hotspot.id)).toHaveLength(1);
  });

  it('un hotspot sans preuve est examiné sans rien découvrir', () => {
    const scene = case001.scenes.find((s) => s.hotspots.some((h) => !h.evidenceId)) ?? case001.scenes[0];
    const plain = scene.hotspots.find((h) => !h.evidenceId);
    const base = freshSave();
    const save = plain ? applyExamination(base, plain, undefined) : base;
    if (plain) {
      expect(save.discoveredEvidenceIds).toHaveLength(0);
      expect(save.examinedHotspotIds).toContain(plain.id);
    }
  });

  it('applyHint incrémente le compteur d\u2019aides', () => {
    expect(applyHint(freshSave()).hintsUsed).toBe(1);
    expect(applyHint(applyHint(freshSave())).hintsUsed).toBe(2);
  });

  it('visibleEvidence ne renvoie que les preuves découvertes', () => {
    const save = freshSave();
    expect(visibleEvidence(case001, save)).toHaveLength(0);
    const first = case001.evidence[0];
    const after = applyExamination(save, { id: 'x', label: '', type: 'circle', x: 0, y: 0, r: 0 }, first);
    expect(visibleEvidence(case001, after).map((e) => e.id)).toEqual([first.id]);
  });

  it('undiscoveredHotspotsInScene liste les zones encore examinables de la scène', () => {
    const scene = case001.scenes[0];
    const save = freshSave();
    const before = undiscoveredHotspotsInScene(case001, save, scene.id);
    expect(before.length).toBeGreaterThan(0);
    const first = before[0];
    const evidence = first.evidenceId ? case001.evidence.find((e) => e.id === first.evidenceId) : undefined;
    const after = applyExamination(save, first, evidence);
    const afterList = undiscoveredHotspotsInScene(case001, after, scene.id);
    expect(afterList.map((h) => h.id)).not.toContain(first.id);
  });

  it('evidenceCountForScene compte les indices découverts d\u2019une scène uniquement', () => {
    const sceneA = case001.scenes[0];
    const sceneB = case001.scenes[1];
    const target = case001.evidence.find((e) => e.sceneId === sceneA.id)!;
    const save = applyExamination(freshSave(), { id: 'x', label: '', type: 'circle', x: 0, y: 0, r: 0 }, target);
    expect(evidenceCountForScene(case001, save, sceneA.id)).toBe(1);
    expect(evidenceCountForScene(case001, save, sceneB.id)).toBe(0);
  });
});
