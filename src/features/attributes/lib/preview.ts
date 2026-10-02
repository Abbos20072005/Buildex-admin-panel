/** "a, b, c +2" — the first items of a long list */
export function previewList(items: string[], max = 3): string {
  if (!items.length) return "";
  const shown = items.slice(0, max).join(", ");
  return items.length > max ? `${shown} +${items.length - max}` : shown;
}
