import dayjs from "dayjs";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, getLanguage, LANGUAGES, type LanguageCode } from "./languages";
import { ru } from "./locales/ru";
import { uz } from "./locales/uz";

const STORAGE_KEY = "buildex_admin_lang";

function detectLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((language) => language.code === saved))
      return saved as LanguageCode;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE;
}

function applyLanguage(code: string) {
  document.documentElement.lang = code;
  dayjs.locale(getLanguage(code).dayjs);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

void i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz }, ru: { translation: ru } },
  lng: detectLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

applyLanguage(i18n.language);
i18n.on("languageChanged", applyLanguage);

export { getLanguage, LANGUAGES, type LanguageCode } from "./languages";
export default i18n;
