import { create } from "zustand";
import { Settings, DEFAULT_SETTINGS } from "../types/settings";

interface SettingsState {
  settings: Settings;
  setSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: DEFAULT_SETTINGS,

  setSettings: (newSettings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    }));
  },

  resetSettings: () => {
    set({
      settings: DEFAULT_SETTINGS,
    });
  },
}));
