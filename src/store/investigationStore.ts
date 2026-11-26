import { create } from 'zustand';
import type { CaseDef } from '@/types/case';
import type { InvestigationSave, DeductionNode, DeductionConnection, SceneViewState, BoardViewState } from '@/types/save';
import type { EvidenceDef, Hotspot } from '@/types/case';
import { applyExamination, applyHint } from '@/features/investigation/discoveryService';
import { nowIso } from '@/utils/time';
import { generateId } from '@/utils/id';
import { BOARD_NODE_WIDTH } from '@/constants';

export interface InvestigationState {
  caseId: string | null;
  save: InvestigationSave | null;
  activeEvidenceId: string | null;
  activeSuspectId: string | null;
  startCase: (c: CaseDef, kind?: 'standard' | 'daily') => void;
  hydrate: (save: InvestigationSave) => void;
  clearActive: () => void;
  enterScene: (sceneId: string) => void;
  examineHotspot: (hotspotId: string, evidenceId?: string) => void;
  useHint: () => void;
  addElapsed: (seconds: number) => void;
  setSceneView: (sceneId: string, view: SceneViewState) => void;
  setBoardView: (view: BoardViewState) => void;
  addEvidenceNode: (evidenceId: string, label: string, detail: string) => void;
  addSuspectNode: (suspectId: string, label: string, detail: string) => void;
  addNoteNode: (label: string, detail: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  removeNode: (id: string) => void;
  addConnection: (fromNodeId: string, toNodeId: string, comment: string) => void;
  updateConnection: (id: string, comment: string) => void;
  removeConnection: (id: string) => void;
  setHypothesis: (suspectId: string, text: string) => void;
  setActiveEvidence: (evidenceId: string | null) => void;
  setActiveSuspect: (suspectId: string | null) => void;
  markSolved: (result: NonNullable<InvestigationSave['lastResult']>) => void;
}

function freshSave(c: CaseDef): InvestigationSave {
  return {
    caseId: c.id,
    status: 'active',
    currentSceneId: c.scenes[0].id,
    visitedScenes: [c.scenes[0].id],
    discoveredEvidenceIds: [],
    examinedHotspotIds: [],
    sceneViews: {},
    hintsUsed: 0,
    elapsedSeconds: 0,
    startedAt: nowIso(),
    updatedAt: nowIso(),
    nodes: [],
    connections: [],
    boardView: { scale: 1, translateX: 0, translateY: 0 },
    suspectHypotheses: {},
    lastResult: null,
  };
}

export const useInvestigationStore = create<InvestigationState>((set) => ({
  caseId: null,
  save: null,
  activeEvidenceId: null,
  activeSuspectId: null,
  startCase: (c) => set({ caseId: c.id, save: freshSave(c), activeEvidenceId: null, activeSuspectId: null }),
  hydrate: (save) => set({ caseId: save.caseId, save, activeEvidenceId: null, activeSuspectId: null }),
  clearActive: () => set({ caseId: null, save: null, activeEvidenceId: null, activeSuspectId: null }),
  enterScene: (sceneId) =>
    set((s) => {
      if (!s.save) return s;
      const visited = s.save.visitedScenes.includes(sceneId)
        ? s.save.visitedScenes
        : [...s.save.visitedScenes, sceneId];
      return { save: { ...s.save, currentSceneId: sceneId, visitedScenes: visited, updatedAt: nowIso() } };
    }),
  examineHotspot: (hotspotId, evidenceId) =>
    set((s) => {
      if (!s.save) return s;
      const hotspot: Hotspot = { id: hotspotId, label: '', type: 'circle', x: 0, y: 0, r: 0 };
      const evidence = evidenceId ? ({ id: evidenceId } as EvidenceDef) : undefined;
      return { save: applyExamination(s.save, hotspot, evidence) };
    }),
  useHint: () =>
    set((s) => (s.save ? { save: applyHint(s.save) } : s)),
  addElapsed: (seconds) =>
    set((s) => (s.save ? { save: { ...s.save, elapsedSeconds: s.save.elapsedSeconds + seconds } } : s)),
  setSceneView: (sceneId, view) =>
    set((s) =>
      s.save
        ? { save: { ...s.save, sceneViews: { ...s.save.sceneViews, [sceneId]: view }, updatedAt: nowIso() } }
        : s
    ),
  setBoardView: (view) => set((s) => (s.save ? { save: { ...s.save, boardView: view, updatedAt: nowIso() } } : s)),
  addEvidenceNode: (evidenceId, label, detail) =>
    set((s) => {
      if (!s.save) return s;
      const node: DeductionNode = {
        id: generateId('node'),
        kind: 'evidence',
        refId: evidenceId,
        label,
        detail,
        x: 40 + ((s.save.nodes.length * (BOARD_NODE_WIDTH + 24)) % 320),
        y: 40 + ((s.save.nodes.length * 130) % 260),
      };
      return { save: { ...s.save, nodes: [...s.save.nodes, node], updatedAt: nowIso() } };
    }),
  addSuspectNode: (suspectId, label, detail) =>
    set((s) => {
      if (!s.save) return s;
      const node: DeductionNode = {
        id: generateId('node'),
        kind: 'suspect',
        refId: suspectId,
        label,
        detail,
        x: 40 + ((s.save.nodes.length * (BOARD_NODE_WIDTH + 24)) % 320),
        y: 40 + ((s.save.nodes.length * 130) % 260),
      };
      return { save: { ...s.save, nodes: [...s.save.nodes, node], updatedAt: nowIso() } };
    }),
  addNoteNode: (label, detail) =>
    set((s) => {
      if (!s.save) return s;
      const node: DeductionNode = {
        id: generateId('node'),
        kind: 'note',
        refId: generateId('note'),
        label,
        detail,
        x: 40 + ((s.save.nodes.length * (BOARD_NODE_WIDTH + 24)) % 320),
        y: 40 + ((s.save.nodes.length * 130) % 260),
      };
      return { save: { ...s.save, nodes: [...s.save.nodes, node], updatedAt: nowIso() } };
    }),
  moveNode: (id, x, y) =>
    set((s) => {
      if (!s.save) return s;
      const nodes = s.save.nodes.map((n) => (n.id === id ? { ...n, x, y } : n));
      return { save: { ...s.save, nodes, updatedAt: nowIso() } };
    }),
  removeNode: (id) =>
    set((s) => {
      if (!s.save) return s;
      const nodes = s.save.nodes.filter((n) => n.id !== id);
      const connections: DeductionConnection[] = s.save.connections.filter(
        (c) => c.fromNodeId !== id && c.toNodeId !== id
      );
      return { save: { ...s.save, nodes, connections, updatedAt: nowIso() } };
    }),
  addConnection: (fromNodeId, toNodeId, comment) =>
    set((s) => {
      if (!s.save) return s;
      const exists = s.save.connections.some(
        (c) =>
          (c.fromNodeId === fromNodeId && c.toNodeId === toNodeId) ||
          (c.fromNodeId === toNodeId && c.toNodeId === fromNodeId)
      );
      if (exists || fromNodeId === toNodeId) return s;
      const connection: DeductionConnection = { id: generateId('conn'), fromNodeId, toNodeId, comment };
      return { save: { ...s.save, connections: [...s.save.connections, connection], updatedAt: nowIso() } };
    }),
  updateConnection: (id, comment) =>
    set((s) => {
      if (!s.save) return s;
      const connections = s.save.connections.map((c) => (c.id === id ? { ...c, comment } : c));
      return { save: { ...s.save, connections, updatedAt: nowIso() } };
    }),
  removeConnection: (id) =>
    set((s) => {
      if (!s.save) return s;
      const connections = s.save.connections.filter((c) => c.id !== id);
      return { save: { ...s.save, connections, updatedAt: nowIso() } };
    }),
  setHypothesis: (suspectId, text) =>
    set((s) => {
      if (!s.save) return s;
      return {
        save: {
          ...s.save,
          suspectHypotheses: { ...s.save.suspectHypotheses, [suspectId]: text },
          updatedAt: nowIso(),
        },
      };
    }),
  setActiveEvidence: (evidenceId) => set({ activeEvidenceId: evidenceId }),
  setActiveSuspect: (suspectId) => set({ activeSuspectId: suspectId }),
  markSolved: (result) =>
    set((s) => (s.save ? { save: { ...s.save, status: 'solved', lastResult: result, updatedAt: nowIso() } } : s)),
}));

export function getActiveSaveSnapshot(): InvestigationSave | null {
  const s = useInvestigationStore.getState();
  return s.save;
}
