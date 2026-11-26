import type { ScoreBreakdown } from './player';
import type { DifficultyLevel } from './case';

export interface SceneViewState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface DeductionNode {
  id: string;
  kind: 'evidence' | 'suspect' | 'note';
  refId: string;
  label: string;
  detail: string;
  x: number;
  y: number;
}

export interface DeductionConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  comment: string;
}

export interface BoardViewState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface PersonalNote {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
  createdAt: string;
}

export interface InvestigationSave {
  caseId: string;
  status: 'active' | 'solved';
  currentSceneId: string;
  visitedScenes: string[];
  discoveredEvidenceIds: string[];
  examinedHotspotIds: string[];
  sceneViews: Record<string, SceneViewState>;
  hintsUsed: number;
  elapsedSeconds: number;
  startedAt: string;
  updatedAt: string;
  nodes: DeductionNode[];
  connections: DeductionConnection[];
  boardView: BoardViewState;
  suspectHypotheses: Record<string, string>;
  lastResult: SavedAccusationResult | null;
}

export interface SavedAccusationResult {
  culpritId: string;
  motiveId: string;
  methodStepIds: string[];
  evidenceIds: string[];
  breakdown: ScoreBreakdown;
  correct: boolean;
  difficulty: DifficultyLevel;
}

export interface DailyResultRow {
  dayKey: string;
  caseId: string;
  score: number;
  elapsedSeconds: number;
  createdAt: string;
}
