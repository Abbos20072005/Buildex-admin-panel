import { hasValue } from "../../lib/characteristics";
import type {
  AttributeValue,
  Localized,
  ProductDetail,
  ProductPatch,
  PublishStatus,
} from "../../model/types";

/**
 * Editable state of the product modal. Texts are kept for every language at once —
 * the cards show only the language picked in the header, the others stay in the form store.
 */
export interface ProductFormValues {
  names: Localized;
  descriptions: Localized;
  shortDescription: string;
  attributeValues: AttributeValue[];
  categoryId: number | null;
  brandId: number | null;
  badgeId: number | null;
  publishStatus: PublishStatus;
  isActive: boolean;
  purchasable: boolean;
}

export const emptyLocalized = (): Localized => ({ uz: "", ru: "" });

export function toFormValues(product: ProductDetail): ProductFormValues {
  return {
    names: { ...product.names },
    descriptions: { ...product.descriptions },
    shortDescription: product.shortDescription,
    attributeValues: product.attributeValues.map((item) => ({ ...item })),
    categoryId: product.category?.id ?? null,
    brandId: product.brand?.id ?? null,
    badgeId: product.badge?.id ?? null,
    publishStatus: product.publishStatus,
    isActive: product.isActive,
    purchasable: product.purchasable,
  };
}

const changedTexts = (before: Localized, after: Localized | undefined) => {
  if (!after) return undefined;
  const diff: Partial<Localized> = {};
  for (const lang of Object.keys(before) as (keyof Localized)[]) {
    if ((after[lang] ?? "") !== before[lang]) diff[lang] = after[lang] ?? "";
  }
  return Object.keys(diff).length ? diff : undefined;
};

/** what is saved: attribute + both texts (the attribute's own details don't matter) */
const signature = (items: AttributeValue[]) =>
  JSON.stringify(items.map((item) => [item.attribute.id, item.uz, item.ru]));

/** Only what the admin actually changed goes to PATCH /admin/products/{id}/. */
export function buildPatch(product: ProductDetail, values: ProductFormValues): ProductPatch {
  const initial = toFormValues(product);
  const patch: ProductPatch = {};

  patch.names = changedTexts(initial.names, values.names);
  patch.descriptions = changedTexts(initial.descriptions, values.descriptions);
  if ((values.shortDescription ?? "") !== initial.shortDescription)
    patch.shortDescription = values.shortDescription ?? "";

  // rows left without a value are not sent — the API doesn't accept empty values
  const attributeValues = (values.attributeValues ?? []).filter(hasValue);
  if (signature(attributeValues) !== signature(initial.attributeValues))
    patch.attributeValues = attributeValues;

  if (values.categoryId !== initial.categoryId) patch.categoryId = values.categoryId ?? null;
  if (values.brandId !== initial.brandId) patch.brandId = values.brandId ?? null;
  if (values.badgeId !== initial.badgeId) patch.badgeId = values.badgeId ?? null;
  if (values.publishStatus !== initial.publishStatus) patch.publishStatus = values.publishStatus;
  if (values.isActive !== initial.isActive) patch.isActive = values.isActive;
  if (values.purchasable !== initial.purchasable) patch.purchasable = values.purchasable;

  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as ProductPatch;
}

/** The saved product with the unsaved form edits on top (live readiness checklist). */
export function withFormValues(
  product: ProductDetail,
  values: Partial<ProductFormValues> | undefined,
): ProductDetail {
  if (!values) return product;
  return {
    ...product,
    names: values.names ?? product.names,
    descriptions: values.descriptions ?? product.descriptions,
    attributeValues: (values.attributeValues ?? product.attributeValues).filter(hasValue),
    category:
      values.categoryId === undefined
        ? product.category
        : values.categoryId
          ? { id: values.categoryId, name: "", path: "" }
          : null,
    brand:
      values.brandId === undefined
        ? product.brand
        : values.brandId
          ? { id: values.brandId, name: "" }
          : null,
  };
}
