import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Settings, DEFAULT_SETTINGS } from "../types/settings";

interface SettingsState {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

// Custom storage for Electron
const electronStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await window.electron.store.get(name);
    return value ? JSON.stringify(value) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const parsed = JSON.parse(value);
    await window.electron.store.set(name, parsed);
  },
  removeItem: async (name: string): Promise<void> => {
    await window.electron.store.set(name, null);
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "stomp-settings",
      storage: createJSONStorage(() => electronStorage),
    }
  )
);
