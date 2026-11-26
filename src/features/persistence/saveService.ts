import type { InvestigationSave, PersonalNote } from '@/types/save';
import type { PlayerProfile, ScoreHistoryEntry } from '@/types/player';

export interface SaveRepository {
  loadActiveSave(): Promise<InvestigationSave | null>;
  loadSave(caseId: string): Promise<InvestigationSave | null>;
  upsertSave(save: InvestigationSave): Promise<void>;
  deleteSave(caseId: string): Promise<void>;
  listNotes(): Promise<PersonalNote[]>;
  upsertNote(note: PersonalNote): Promise<void>;
  deleteNote(id: string): Promise<void>;
  loadProfile(): Promise<PlayerProfile | null>;
  upsertProfile(p: PlayerProfile): Promise<void>;
  addScoreEntry(e: ScoreHistoryEntry): Promise<void>;
  listScoreEntries(): Promise<ScoreHistoryEntry[]>;
}

export function createSaveService(repo: SaveRepository) {
  return {
    async loadActiveInvestigation(): Promise<InvestigationSave | null> {
      return repo.loadActiveSave();
    },
    async loadInvestigation(caseId: string): Promise<InvestigationSave | null> {
      return repo.loadSave(caseId);
    },
    async persistSave(save: InvestigationSave): Promise<void> {
      await repo.upsertSave({ ...save, updatedAt: new Date().toISOString() });
    },
    async abandonSave(caseId: string): Promise<void> {
      await repo.deleteSave(caseId);
    },
    async loadNotes(): Promise<PersonalNote[]> {
      return repo.listNotes();
    },
    async persistNote(note: PersonalNote): Promise<void> {
      await repo.upsertNote(note);
    },
    async removeNote(id: string): Promise<void> {
      await repo.deleteNote(id);
    },
    async loadProfile(): Promise<PlayerProfile | null> {
      return repo.loadProfile();
    },
    async persistProfile(p: PlayerProfile): Promise<void> {
      await repo.upsertProfile(p);
    },
    async recordScore(e: ScoreHistoryEntry): Promise<void> {
      await repo.addScoreEntry(e);
    },
    async loadScores(): Promise<ScoreHistoryEntry[]> {
      return repo.listScoreEntries();
    },
  };
}

export type SaveService = ReturnType<typeof createSaveService>;
