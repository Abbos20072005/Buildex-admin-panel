import type { FormInstance } from "antd";
import type { NamePath } from "antd/es/form/interface";
import { ApiError, getErrorMessage } from "@/shared/api";

/** API field name → form field name, for fields that are named differently ("name_uz" → ["names", "uz"]). */
export type FieldMap = Record<string, NamePath>;

const camel = (key: string) => key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Every message of a DRF error value: "text", ["text"], or nested { key: ["text"] }. */
function messages(value: unknown): string[] {
  if (typeof value === "string") return value ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(messages);
  if (isRecord(value)) return Object.values(value).flatMap(messages);
  return [];
}

/**
 * Puts a 400 response's field errors next to their fields (and scrolls to the first one).
 * Returns the text for a toast when something is left over — a general error, or a field the
 * form doesn't have — and null when every error found its field.
 */
export function applyServerErrors<T>(
  form: FormInstance<T>,
  error: unknown,
  fieldMap: FieldMap = {},
): string | null {
  if (!(error instanceof ApiError) || error.status !== 400 || !isRecord(error.body)) {
    return getErrorMessage(error);
  }

  const known = form.getFieldsValue(true) as Record<string, unknown>;
  const fields: { name: NamePath; errors: string[] }[] = [];
  const rest: string[] = [];

  for (const [key, value] of Object.entries(error.body)) {
    const errors = messages(value);
    if (errors.length === 0) continue;
    const name = fieldMap[key] ?? (camel(key) in known ? camel(key) : undefined);
    if (name) fields.push({ name, errors });
    else rest.push(errors[0]);
  }

  if (fields.length > 0) {
    form.setFields(fields);
    form.scrollToField(fields[0].name, { block: "center" });
  }
  if (rest.length > 0) return rest[0];
  return fields.length > 0 ? null : getErrorMessage(error);
}
