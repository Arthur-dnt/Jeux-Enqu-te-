import type { SaveRepository } from '@/features/persistence/saveService';
import type { InvestigationSave, PersonalNote } from '@/types/save';
import type { PlayerProfile, ScoreHistoryEntry } from '@/types/player';

export function createInMemorySaveRepository(): SaveRepository {
  const saves = new Map<string, InvestigationSave>();
  const notes = new Map<string, PersonalNote>();
  let profile: PlayerProfile | null = null;
  const scoreEntries: ScoreHistoryEntry[] = [];
  return {
    async loadActiveSave() {
      const all = [...saves.values()].filter((s) => s.status === 'active');
      all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return all[0] ?? null;
    },
    async loadSave(caseId) {
      return saves.get(caseId) ?? null;
    },
    async upsertSave(s) {
      saves.set(s.caseId, JSON.parse(JSON.stringify(s)) as InvestigationSave);
    },
    async deleteSave(caseId) {
      saves.delete(caseId);
    },
    async listNotes() {
      return [...notes.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((n) => ({ ...n }));
    },
    async upsertNote(n) {
      notes.set(n.id, { ...n });
    },
    async deleteNote(id) {
      notes.delete(id);
    },
    async loadProfile() {
      return profile ? { ...profile } : null;
    },
    async upsertProfile(p) {
      profile = { ...p };
    },
    async addScoreEntry(e) {
      scoreEntries.push({ ...e });
    },
    async listScoreEntries() {
      return [...scoreEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((e) => ({ ...e }));
    },
  };
}
