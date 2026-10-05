/** Content languages of the API fields (`title_uz`, `title_ru`, `title_en`). Russian is the required one. */
export const CONTENT_LANGS = ["uz", "ru", "en"] as const;
export type ContentLang = (typeof CONTENT_LANGS)[number];

export type Localized = Record<ContentLang, string>;

export const emptyLocalized = (): Localized => ({ uz: "", ru: "", en: "" });

/** { title_uz, title_ru, title_en } → { uz, ru, en } (null becomes "") */
export function readLocalized(dto: object, base: string): Localized {
  const record = dto as Record<string, string | null | undefined>;
  return {
    uz: record[`${base}_uz`] ?? "",
    ru: record[`${base}_ru`] ?? "",
    en: record[`${base}_en`] ?? "",
  };
}

/** { uz, ru, en } → { title_uz, title_ru, title_en }; an empty optional language is sent as null */
export function writeLocalized(base: string, value: Localized): Record<string, string | null> {
  return Object.fromEntries(
    CONTENT_LANGS.map((code) => [`${base}_${code}`, value[code].trim() || null]),
  );
}

/** Rich text with no visible content: "", "<p><br></p>", "&nbsp;" */
export function isBlankHtml(html: string | undefined): boolean {
  if (!html) return true;
  if (/<img\b/i.test(html)) return false;
  return !html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** The language of the first failed `…Ru` field, so the form can switch to the tab with the error. */
export function failedLang(error: unknown): ContentLang | null {
  const fields = (error as { errorFields?: { name: (string | number)[] }[] }).errorFields ?? [];
  const codes = fields.map((field) => field.name[field.name.length - 1]);
  return CONTENT_LANGS.find((code) => codes.includes(code)) ?? null;
}
