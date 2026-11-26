import type { SaveRepository } from '@/features/persistence/saveService';
import * as progress from './progressRepository';
import * as notes from './notesRepository';
import * as profile from './profileRepository';
import * as scores from './scoreRepository';

export const sqliteSaveRepository: SaveRepository = {
  loadActiveSave: () => progress.getActiveSave(),
  loadSave: (caseId) => progress.loadSave(caseId),
  upsertSave: (s) => progress.upsertSave(s),
  deleteSave: (caseId) => progress.deleteSave(caseId),
  listNotes: () => notes.listNotes(),
  upsertNote: (n) => notes.upsertNote(n),
  deleteNote: (id) => notes.deleteNote(id),
  loadProfile: () => profile.loadProfile(),
  upsertProfile: (p) => profile.upsertProfile(p),
  addScoreEntry: (e) => scores.addScoreEntry(e),
  listScoreEntries: () => scores.listScoreEntries(),
};
