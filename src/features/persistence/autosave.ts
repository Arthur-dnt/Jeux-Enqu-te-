import { useInvestigationStore } from '@/store/investigationStore';
import { useNotebookStore } from '@/store/notebookStore';
import { useProfileStore } from '@/store/profileStore';
import { createSaveService } from './saveService';
import type { SaveRepository } from './saveService';
import { AUTOSAVE_DEBOUNCE_MS, NOTE_SAVE_DEBOUNCE_MS } from '@/constants';
import { getAllCases } from '@/features/cases/caseRegistry';

let saveServiceInstance: ReturnType<typeof createSaveService> | null = null;

export function getSaveService(): ReturnType<typeof createSaveService> {
  if (!saveServiceInstance) throw new Error('Persistence non initialisée');
  return saveServiceInstance;
}

export function initPersistence(repo: SaveRepository): ReturnType<typeof createSaveService> {
  saveServiceInstance = createSaveService(repo);

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let noteTimer: ReturnType<typeof setTimeout> | null = null;
  let profileTimer: ReturnType<typeof setTimeout> | null = null;

  useInvestigationStore.subscribe((state) => {
    if (!state.save) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const snapshot = useInvestigationStore.getState().save;
      if (snapshot) {
        getSaveService().persistSave(snapshot).catch((e) => console.warn('[autosave] échec:', e));
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  });

  useNotebookStore.subscribe((state) => {
    if (!state.hydrated) return;
    if (noteTimer) clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      const notes = useNotebookStore.getState().notes;
      const service = getSaveService();
      service.loadNotes().then((persisted) => {
        const persistedIds = new Set(persisted.map((n) => n.id));
        const currentIds = new Set(notes.map((n) => n.id));
        Promise.all([
          ...notes.map((n) => service.persistNote(n)),
          ...persisted.filter((p) => !currentIds.has(p.id)).map((p) => service.removeNote(p.id)),
        ]).catch((e) => console.warn('[notes] échec sauvegarde:', e));
        void persistedIds;
      });
    }, NOTE_SAVE_DEBOUNCE_MS);
  });

  useProfileStore.subscribe((state) => {
    if (!state.profile) return;
    if (profileTimer) clearTimeout(profileTimer);
    profileTimer = setTimeout(() => {
      const profile = useProfileStore.getState().profile;
      if (!profile) return;
      getSaveService().persistProfile(profile).catch((e) => console.warn('[profil] échec sauvegarde:', e));
    }, AUTOSAVE_DEBOUNCE_MS);
  });

  return saveServiceInstance;
}

export async function bootstrapPersistence(): Promise<void> {
  const service = getSaveService();
  const [activeSave, notes, profile, scores] = await Promise.all([
    service.loadActiveInvestigation(),
    service.loadNotes(),
    service.loadProfile(),
    service.loadScores(),
  ]);
  if (activeSave) {
    const exists = getAllCases().some((c) => c.id === activeSave.caseId);
    if (exists) useInvestigationStore.getState().hydrate(activeSave);
  }
  useNotebookStore.getState().hydrate(notes);
  useProfileStore.getState().hydrate(profile, scores);
}
