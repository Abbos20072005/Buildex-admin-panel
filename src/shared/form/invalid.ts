interface FailedField {
  name: (string | number)[];
  errors: string[];
}

const MAX_SHOWN = 4;

/** The label of a field's form item, read from the page (a field on a hidden tab is still mounted). */
function labelOf(name: (string | number)[]): string {
  const id = name.join("_");
  const label =
    document.querySelector(`label[for="${id}"]`) ?? document.querySelector(`label[for$="_${id}"]`);
  let text = (label?.textContent ?? "").replace(/\*/g, "").trim();
  // a translated field is named `[field, "ru"]`: say which language when the label does not
  const code = name[name.length - 1];
  if (text && (code === "uz" || code === "ru" || code === "en") && !text.includes("(")) {
    text += ` (${code.toUpperCase()})`;
  }
  return text;
}

/**
 * A save pressed with an invalid form: the red field may be on another tab or below the fold, so
 * the user sees nothing happen. Say which fields are wrong ("Nomi (RU): Majburiy maydon").
 */
export function reportInvalid(error: unknown, message: { error: (text: string) => unknown }) {
  const fields = (error as { errorFields?: FailedField[] }).errorFields ?? [];
  const lines = fields.flatMap(({ name, errors }) => {
    const text = errors[0];
    if (!text) return [];
    const label = labelOf(name);
    return [label ? `${label}: ${text}` : text];
  });
  if (!lines.length) return;
  const shown = lines.slice(0, MAX_SHOWN).join(" · ");
  message.error(lines.length > MAX_SHOWN ? `${shown} (+${lines.length - MAX_SHOWN})` : shown);
}
