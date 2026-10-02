import type { AttributeValue, ProductAttribute } from "../model/types";

/** An attribute row without a value is not sent (the API doesn't accept empty values). */
export const hasValue = (item: AttributeValue) => !!(item.uz.trim() || item.ru.trim());

/** Text shown for a filled attribute: "3 t", "Pult (simli)", "Ha". */
export function formatAttributeValue(item: AttributeValue, lang: "uz" | "ru"): string {
  const text = item[lang] || item.uz || item.ru;
  if (item.attribute.valueType === "boolean") return text === "true" ? "✓" : "✗";
  return [text, item.attribute.unit].filter(Boolean).join(" ");
}

/** New row for the picked attribute: lists and text start empty, a switch starts at "false". */
export function emptyAttributeValue(attribute: ProductAttribute): AttributeValue {
  const initial = attribute.valueType === "boolean" ? "false" : "";
  return { attribute, uz: initial, ru: initial };
}
