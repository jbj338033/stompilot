import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "../stores/settings";
import { ThemeType, LanguageType } from "../types/settings";
import {
  IoMoon,
  IoSunny,
  IoLanguage,
  IoNotifications,
  IoSync,
  IoTime,
  IoCode,
  IoChevronBack,
  IoAlertCircle,
} from "react-icons/io5";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Toggle } from "../components/Toggle";
import { SettingCard } from "../components/SettingCard";
import { LoadingButton } from "../components/LoadingButton";

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings, setSettings, resetSettings } = useSettingsStore();

  const handleThemeChange = (theme: ThemeType) => {
    setSettings({ theme });
    toast.success(t("settings.themeChanged"));
  };

  const handleLanguageChange = (language: LanguageType) => {
    setSettings({ language });
    i18n.changeLanguage(language);
    toast.success(t("settings.languageChanged"));
  };

  const handleReset = () => {
    if (window.confirm(t("settings.resetConfirm"))) {
      resetSettings();
      i18n.changeLanguage(settings.language);
      toast.success(t("settings.resetSuccess"));
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto py-6 px-4"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <IoChevronBack size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("settings.title")}
            </h1>
          </div>
          <LoadingButton
            onClick={handleReset}
            variant="danger"
            size="sm"
            icon={<IoAlertCircle />}
          >
            {t("settings.reset")}
          </LoadingButton>
        </div>

        <div className="space-y-6">
          <SettingCard
            icon={
              settings.theme === "dark" ? (
                <IoMoon size={24} />
              ) : (
                <IoSunny size={24} />
              )
            }
            title={t("settings.theme.title")}
            description={t("settings.theme.description")}
          >
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as ThemeType[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      settings.theme === theme
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  {t(`settings.theme.${theme}`)}
                </button>
              ))}
            </div>
          </SettingCard>

          <SettingCard
            icon={<IoLanguage size={24} />}
            title={t("settings.language.title")}
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: "en", label: "English" },
                { code: "ko", label: "한국어" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() =>
                    handleLanguageChange(lang.code as LanguageType)
                  }
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      settings.language === lang.code
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </SettingCard>

          <div className="space-y-4">
            {[
              {
                key: "autoReconnect",
                icon: <IoSync size={24} />,
                title: t("settings.behavior.autoReconnect"),
                description: t("settings.behavior.autoReconnectDescription"),
              },
              {
                key: "showTimestamps",
                icon: <IoTime size={24} />,
                title: t("settings.behavior.showTimestamps"),
                description: t("settings.behavior.showTimestampsDescription"),
              },
              {
                key: "notificationsEnabled",
                icon: <IoNotifications size={24} />,
                title: t("settings.behavior.notifications"),
                description: t("settings.behavior.notificationsDescription"),
              },
              {
                key: "formatJsonMessages",
                icon: <IoCode size={24} />,
                title: t("settings.behavior.formatJson"),
                description: t("settings.behavior.formatJsonDescription"),
              },
            ].map(({ key, icon, title, description }) => (
              <SettingCard
                key={key}
                icon={icon}
                title={title}
                description={description}
              >
                <Toggle
                  checked={settings[key as keyof typeof settings] as boolean}
                  onChange={(checked) => setSettings({ [key]: checked })}
                />
              </SettingCard>
            ))}
          </div>

          <SettingCard
            icon={<IoCode size={24} />}
            title={t("settings.behavior.maxMessages")}
            description={t("settings.behavior.maxMessagesDescription")}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  100
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {settings.maxMessages}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  5000
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={settings.maxMessages}
                onChange={(e) =>
                  setSettings({ maxMessages: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                  dark:bg-gray-700 accent-blue-600 dark:accent-blue-400"
              />
            </div>
          </SettingCard>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Settings;
