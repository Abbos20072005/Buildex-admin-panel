import type { Locale } from "antd/es/locale";
import ruRU from "antd/locale/ru_RU";
import uzUZ from "antd/locale/uz_UZ";
import "dayjs/locale/ru";
import "dayjs/locale/uz-latn";

export interface LanguageOption {
  code: "uz" | "ru";
  label: string;
  short: string;
  /** Ant Design component texts (pagination, date picker…) */
  antd: Locale;
  /** dayjs locale id (month names in the date picker) */
  dayjs: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "uz", label: "O‘zbekcha", short: "UZ", antd: uzUZ, dayjs: "uz-latn" },
  { code: "ru", label: "Русский", short: "RU", antd: ruRU, dayjs: "ru" },
];

export type LanguageCode = LanguageOption["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "uz";

export function getLanguage(code: string | undefined): LanguageOption {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
}
