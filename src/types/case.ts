export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: 'Débutante',
  2: 'Intermédiaire',
  3: 'Connexions',
  4: 'Complexe',
  5: 'Experte',
};

export type EvidenceCategory =
  | 'physical_object'
  | 'photograph'
  | 'document'
  | 'testimony'
  | 'technical_report'
  | 'material_trace'
  | 'time_record'
  | 'written_message'
  | 'visual_observation'
  | 'chronological_clue';

export const EVIDENCE_CATEGORY_LABELS: Record<EvidenceCategory, string> = {
  physical_object: 'Objet physique',
  photograph: 'Photographie',
  document: 'Document',
  testimony: 'Témoignage',
  technical_report: 'Rapport technique',
  material_trace: 'Trace matérielle',
  time_record: 'Enregistrement horaire',
  written_message: 'Message écrit',
  visual_observation: 'Observation visuelle',
  chronological_clue: 'Indice chronologique',
};

export type HotspotShape =
  | { type: 'circle'; x: number; y: number; r: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number }
  | { type: 'polygon'; points: [number, number][] };

export type Hotspot = HotspotShape & {
  id: string;
  label: string;
  evidenceId?: string;
};

export interface SceneDef {
  id: string;
  name: string;
  artKey: string;
  description: string;
  hotspots: Hotspot[];
}

export interface EvidenceDef {
  id: string;
  name: string;
  category: EvidenceCategory;
  sceneId: string;
  description: string;
  detail: string;
  icon: string;
  metadata?: Record<string, string>;
}

export interface SuspectDef {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relation: string;
  statement: string;
  timeline: string[];
  relatedEvidenceIds: string[];
}

export interface MotiveOption {
  id: string;
  label: string;
}

export interface MethodStepOption {
  id: string;
  label: string;
}

export interface PostResolutionReveal {
  evidenceName: string;
  text: string;
}

export interface CaseSolution {
  culpritId: string;
  motiveId: string;
  methodStepIds: string[];
  decisiveEvidenceIds: string[];
  explanation: string;
  postResolutionReveal: PostResolutionReveal;
}

export interface CaseDef {
  id: string;
  number: string;
  title: string;
  difficulty: DifficultyLevel;
  type: string;
  estimatedMinutes: number;
  summary: string;
  briefing: string;
  locationName: string;
  caseDate: string;
  scenes: SceneDef[];
  evidence: EvidenceDef[];
  suspects: SuspectDef[];
  motives: MotiveOption[];
  methodSteps: MethodStepOption[];
  solution: CaseSolution;
  rewardXp: number;
}

export type CaseStatus = 'not_started' | 'in_progress' | 'solved' | 'replayable';
