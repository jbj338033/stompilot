export type ThemeType = "light" | "dark" | "system";
export type LanguageType = "en" | "ko";

export interface Settings {
  theme: ThemeType;
  language: LanguageType;
  autoReconnect: boolean;
  maxMessages: number;
  showTimestamps: boolean;
  notificationsEnabled: boolean;
  formatJsonMessages: boolean;
  autoScrollEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  language: "en",
  autoReconnect: true,
  maxMessages: 1000,
  showTimestamps: true,
  notificationsEnabled: true,
  formatJsonMessages: true,
  autoScrollEnabled: true,
};

export interface ElectronStore {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  remove: (key: string) => Promise<void>;
}
