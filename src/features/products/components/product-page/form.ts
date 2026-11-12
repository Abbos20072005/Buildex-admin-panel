import type { FieldMap } from "@/shared/form";
import { hasValue } from "../../lib/characteristics";
import {
  LINK_KINDS,
  type AttributeValue,
  type Localized,
  type ProductCreate,
  type ProductDetail,
  type ProductLinks,
  type ProductPatch,
  type PublishStatus,
  type Unit,
} from "../../model/types";

/**
 * Editable state of the product modal. Texts are kept for every language at once —
 * the cards show only the language picked in the header, the others stay in the form store.
 */
export interface ProductFormValues {
  names: Localized;
  descriptions: Localized;
  shortDescriptions: Localized;
  links: ProductLinks;
  attributeValues: AttributeValue[];
  categoryId: number | null;
  brandId: number | null;
  badgeId: number | null;
  publishStatus: PublishStatus;
  isActive: boolean;
  purchasable: boolean;
}

/** API field of a server validation error → form field (the rest are the same in camelCase) */
export const PRODUCT_ERROR_FIELDS: FieldMap = {
  name_uz: ["names", "uz"],
  name_ru: ["names", "ru"],
  name_en: ["names", "en"],
  description_uz: ["descriptions", "uz"],
  description_ru: ["descriptions", "ru"],
  description_en: ["descriptions", "en"],
  short_description_uz: ["shortDescriptions", "uz"],
  short_description_ru: ["shortDescriptions", "ru"],
  related_products: ["links", "related"],
  alternative_products: ["links", "alternative"],
  cross_sell_products: ["links", "crossSell"],
  category: "categoryId",
  product_item_category: "categoryId",
  brand: "brandId",
  badge: "badgeId",
  badges: "badgeId",
  product_model: "modelId",
  articul_code: "articul",
};

/** The form of a new product: everything of the edit form plus prices, codes and sizes. */
export interface ProductCreateValues extends ProductFormValues {
  modelId: number | null;
  price: number | null;
  discountPrice: number | null;
  discount: number | null;
  unit: Unit;
  quantity: number | null;
  articul: string;
  barcode: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  onOrder: boolean;
}

export function emptyCreateValues(): ProductCreateValues {
  return {
    names: emptyLocalized(),
    descriptions: emptyLocalized(),
    shortDescriptions: emptyLocalized(),
    links: { related: [], alternative: [], crossSell: [] },
    attributeValues: [],
    categoryId: null,
    brandId: null,
    modelId: null,
    badgeId: null,
    publishStatus: "draft",
    isActive: false,
    purchasable: false,
    onOrder: false,
    price: null,
    discountPrice: null,
    discount: null,
    unit: "pcs",
    quantity: 0,
    articul: "",
    barcode: "",
    weight: "",
    length: "",
    width: "",
    height: "",
  };
}

/** The form → the body of POST /admin/products/ (photos and activation follow it). */
export function toCreateInput(values: ProductCreateValues): ProductCreate {
  const ids = (kind: (typeof LINK_KINDS)[number]) =>
    (values.links?.[kind] ?? []).map((item) => item.id);
  return {
    names: values.names,
    descriptions: values.descriptions,
    shortDescriptions: values.shortDescriptions,
    brandId: values.brandId,
    modelId: values.modelId,
    categoryId: values.categoryId,
    badgeId: values.badgeId,
    price: values.price,
    discountPrice: values.discountPrice,
    discount: values.discount,
    unit: values.unit,
    quantity: values.quantity,
    articul: values.articul ?? "",
    barcode: values.barcode ?? "",
    weight: values.weight ?? "",
    length: values.length ?? "",
    width: values.width ?? "",
    height: values.height ?? "",
    attributeValues: (values.attributeValues ?? []).filter(hasValue),
    links: {
      related: ids("related"),
      alternative: ids("alternative"),
      crossSell: ids("crossSell"),
    },
    purchasable: values.purchasable,
    onOrder: values.onOrder,
  };
}

/**
 * A product that doesn't exist yet, for the cards that take one (the readiness list, the
 * pickers): it has no id, no links and only the photos that are waiting to be uploaded.
 */
export function placeholderProduct(
  publishStatus: PublishStatus,
  images: ProductDetail["images"],
): ProductDetail {
  return {
    id: 0,
    name: "",
    code: null,
    articul: null,
    barcode: null,
    brand: null,
    badge: null,
    price: 0,
    discountPrice: null,
    discount: null,
    unit: "pcs",
    quantity: 0,
    rating: 0,
    isActive: false,
    erpActive: false,
    publishStatus,
    purchasable: false,
    createdAt: "",
    updatedAt: "",
    names: emptyLocalized(),
    descriptions: emptyLocalized(),
    shortDescriptions: emptyLocalized(),
    links: { related: [], alternative: [], crossSell: [] },
    category: null,
    images,
    attributeValues: [],
    weight: null,
    length: null,
    width: null,
    height: null,
    commentsCount: 0,
    questionsCount: 0,
  };
}

export const emptyLocalized = (): Localized => ({ uz: "", ru: "" });

export function toFormValues(product: ProductDetail): ProductFormValues {
  return {
    names: { ...product.names },
    descriptions: { ...product.descriptions },
    shortDescriptions: { ...product.shortDescriptions },
    links: {
      related: [...product.links.related],
      alternative: [...product.links.alternative],
      crossSell: [...product.links.crossSell],
    },
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
  patch.shortDescriptions = changedTexts(initial.shortDescriptions, values.shortDescriptions);

  // a kind of link is sent only when its ids or their order changed
  for (const kind of LINK_KINDS) {
    const ids = (values.links?.[kind] ?? initial.links[kind]).map((item) => item.id);
    const before = initial.links[kind].map((item) => item.id);
    if (ids.join() !== before.join()) patch.links = { ...patch.links, [kind]: ids };
  }

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
