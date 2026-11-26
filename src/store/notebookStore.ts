import { create } from 'zustand';
import type { PersonalNote } from '@/types/save';
import { nowIso } from '@/utils/time';
import { generateId } from '@/utils/id';

export interface NotebookState {
  notes: PersonalNote[];
  hydrated: boolean;
  hydrate: (notes: PersonalNote[]) => void;
  createNote: () => string;
  updateNote: (id: string, patch: Partial<Pick<PersonalNote, 'title' | 'body'>>) => void;
  deleteNote: (id: string) => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  notes: [],
  hydrated: false,
  hydrate: (notes) => set({ notes, hydrated: true }),
  createNote: () => {
    const id = generateId('note');
    const now = nowIso();
    set((s) => ({ notes: [{ id, title: 'Nouvelle note', body: '', createdAt: now, updatedAt: now }, ...s.notes] }));
    return id;
  },
  updateNote: (id, patch) =>
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: nowIso() } : n)),
    })),
  deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
}));
