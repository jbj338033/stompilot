import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en";
import koTranslation from "./locales/ko";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },
    ko: {
      translation: koTranslation,
    },
  },
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
