/** The UZ or RU text for the admin UI language; the other one when it is empty. */
export const byLang = (uz: string, ru: string, lang: string) =>
  lang.startsWith("uz") ? uz || ru : ru || uz;

/** An answer's HTML as one line of plain text (for the table). */
export const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** The list with the item at `index` moved one place (`-1` up, `1` down); null at the edges. */
export function movedIds(ids: number[], index: number, step: -1 | 1): number[] | null {
  const target = index + step;
  if (target < 0 || target >= ids.length) return null;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
