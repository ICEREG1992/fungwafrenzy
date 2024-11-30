import { create } from 'zustand';
import { userSettings } from '../renderer/interfaces';

interface SettingsStore {
  settings: userSettings;
  setSettings: (settings: userSettings) => void;
  updateSettings: (partial: Partial<userSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    selected_impact: '',
    player_theme: 'classic',
    impact_folder_path: 'x',
    save_folder_path: 'y',
    username: '',
    class: '',
    location: '',
    resolution_x: 1024,
    resolution_y: 728,
    fullscreen: false,
    volume_master: 100,
    volume_video: 100,
    volume_music: 80,
  },
  setSettings: (settings) => set({ settings }),
  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),
}));
