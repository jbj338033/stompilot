import { useEffect, useState } from "react";
import { Settings, DEFAULT_SETTINGS } from "../types/settings";
import Store from "electron-store";

const store = new Store({
  name: "settings",
  defaults: {
    settings: DEFAULT_SETTINGS,
  },
});

class SettingsStore {
  private static instance: SettingsStore;
  private subscribers: ((settings: Settings) => void)[] = [];

  private constructor() {}

  static getInstance(): SettingsStore {
    if (!SettingsStore.instance) {
      SettingsStore.instance = new SettingsStore();
    }
    return SettingsStore.instance;
  }

  getSettings(): Settings {
    return store.get("settings") as Settings;
  }

  setSettings(newSettings: Partial<Settings>): void {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    store.set("settings", updatedSettings);
    this.notifySubscribers(updatedSettings);
  }

  resetSettings(): void {
    store.set("settings", DEFAULT_SETTINGS);
    this.notifySubscribers(DEFAULT_SETTINGS);
  }

  subscribe(callback: (settings: Settings) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private notifySubscribers(settings: Settings): void {
    this.subscribers.forEach((callback) => callback(settings));
  }
}

// React Hook for using settings
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() =>
    SettingsStore.getInstance().getSettings()
  );

  useEffect(() => {
    const unsubscribe = SettingsStore.getInstance().subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    settings,
    setSettings: (newSettings: Partial<Settings>) => {
      SettingsStore.getInstance().setSettings(newSettings);
    },
    resetSettings: () => {
      SettingsStore.getInstance().resetSettings();
    },
  };
}
