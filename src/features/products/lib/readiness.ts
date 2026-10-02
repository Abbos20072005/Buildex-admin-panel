import type { ProductDetail } from "../model/types";

export interface ReadinessCheck {
  /** i18n key under products.readiness */
  key: string;
  done: boolean;
}

/** What a product needs before it can be published (the "Tayyorlik" checklist). */
export function getReadiness(product: ProductDetail): ReadinessCheck[] {
  const filled = (value: string) => value.replace(/<[^>]*>/g, "").trim().length > 0;
  return [
    { key: "nameUz", done: filled(product.names.uz) },
    { key: "nameRu", done: filled(product.names.ru) },
    { key: "descriptionUz", done: filled(product.descriptions.uz) },
    { key: "descriptionRu", done: filled(product.descriptions.ru) },
    { key: "image", done: product.images.length > 0 },
    { key: "characteristics", done: product.attributeValues.length > 0 },
    { key: "category", done: !!product.category },
    { key: "brand", done: !!product.brand },
  ];
}
