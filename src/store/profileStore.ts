import { create } from 'zustand';
import type { PlayerProfile, ScoreHistoryEntry, CasePerformance } from '@/types/player';
import { nowIso } from '@/utils/time';
import { generateId } from '@/utils/id';
import { aggregatePerformance } from '@/features/progression/progressionService';
import { getSaveService } from '@/features/persistence/autosave';

export interface ProfileState {
  profile: PlayerProfile | null;
  scores: ScoreHistoryEntry[];
  hydrated: boolean;
  hydrate: (profile: PlayerProfile | null, scores: ScoreHistoryEntry[]) => void;
  ensureProfile: () => PlayerProfile;
  setPseudo: (pseudo: string) => void;
  addXp: (xp: number) => void;
  recordScore: (entry: Omit<ScoreHistoryEntry, 'id' | 'createdAt'>, xpGain?: number) => ScoreHistoryEntry;
  bestPerformanceForCase: (caseId: string) => CasePerformance;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  scores: [],
  hydrated: false,
  hydrate: (profile, scores) => set({ profile, scores, hydrated: true }),
  ensureProfile: () => {
    const p = get().profile;
    if (p) return p;
    const now = nowIso();
    const fresh: PlayerProfile = { id: generateId('player'), pseudo: 'Enquêteur anonyme', xp: 0, createdAt: now, updatedAt: now };
    set({ profile: fresh });
    return fresh;
  },
  setPseudo: (pseudo) =>
    set((s) =>
      s.profile
        ? { profile: { ...s.profile, pseudo: pseudo.trim() || s.profile.pseudo, updatedAt: nowIso() } }
        : s
    ),
  addXp: (xp) =>
    set((s) =>
      s.profile ? { profile: { ...s.profile, xp: s.profile.xp + xp, updatedAt: nowIso() } } : s
    ),
  recordScore: (entry, xpGain) => {
    const full: ScoreHistoryEntry = { ...entry, id: generateId('score'), createdAt: nowIso() };
    set((s) => ({ scores: [full, ...s.scores] }));
    get().addXp(xpGain ?? Math.round(full.breakdown.total / 10) + 5);
    try {
      getSaveService().recordScore(full).catch((e) => console.warn('[score] échec sauvegarde:', e));
    } catch {
      // persistance non initialisée (tests) : l'entrée reste en mémoire
    }
    return full;
  },
  bestPerformanceForCase: (caseId) =>
    aggregatePerformance(get().scores.filter((e) => e.caseId === caseId).map((e) => ({ score: e.score, elapsedSeconds: e.elapsedSeconds }))),
}));
