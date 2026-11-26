import { create } from 'zustand';

export interface SettingsState {
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  reduceMotion: false,
  toggleReduceMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),
}));
