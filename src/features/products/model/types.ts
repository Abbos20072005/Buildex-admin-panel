import type { LanguageCode } from "@/shared/i18n";

export type PublishStatus = "draft" | "review" | "published";
export type Unit = "pcs" | "kg" | "g" | "l" | "m" | "sm" | "pkg" | "set";

/** text in every content language: { uz, ru } */
export type Localized = Record<LanguageCode, string>;

export interface NamedRef {
  id: number;
  name: string;
}

export interface ProductImage {
  id: number;
  url: string;
}

/** Row of the product list (GET /admin/products/). */
export interface Product {
  id: number;
  name: string;
  code: string | null;
  articul: string | null;
  barcode: string | null;
  image: string | null;
  imagesCount: number;
  brand: NamedRef | null;
  badge: NamedRef | null;
  category: NamedRef | null;
  price: number;
  discountPrice: number | null;
  discount: number | null;
  unit: Unit;
  quantity: number;
  rating: number;
  commentsCount: number;
  isActive: boolean;
  erpActive: boolean;
  publishStatus: PublishStatus;
  purchasable: boolean;
  createdAt: string;
  updatedAt: string;
}

/** How the value of an attribute is entered (`value_type` of GET /admin/attributes/). */
export type AttributeValueType = "number" | "list" | "text" | "boolean";

export interface AttributeOption {
  id: number;
  uz: string;
  ru: string;
}

/** Attribute (xususiyat) attached to an item category; the product gets a value for it. */
export interface ProductAttribute {
  id: number;
  /** name in the admin UI language */
  name: string;
  valueType: AttributeValueType;
  /** only for numbers */
  unit: string;
  /** only for lists */
  options: AttributeOption[];
  isFilterable: boolean;
}

/** Value of one attribute on a product (`attribute_values` of GET /admin/products/{id}/). */
export interface AttributeValue {
  attribute: Pick<ProductAttribute, "id" | "name" | "valueType" | "unit"> &
    Partial<Pick<ProductAttribute, "options" | "isFilterable">>;
  uz: string;
  ru: string;
}

/** Item category with its parents — "Category / Sub category / Item category". */
export interface CategoryPath extends NamedRef {
  path: string;
}

/** The three kinds of links between products (all one-way: A → B doesn't add B → A). */
export const LINK_KINDS = ["related", "alternative", "crossSell"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

/** Most products one kind of link can hold. */
export const MAX_LINKED_PRODUCTS = 20;

/** A product linked to another one — enough to show it in a list and mark it when sold out. */
export interface LinkedProduct {
  id: number;
  name: string;
  image: string | null;
  code: string | null;
  articul: string | null;
  price: number;
  discountPrice: number | null;
  quantity: number;
  isActive: boolean;
}

export type ProductLinks = Record<LinkKind, LinkedProduct[]>;

/** Full product (GET /admin/products/{id}/). */
export interface ProductDetail extends Omit<
  Product,
  "image" | "imagesCount" | "category" | "commentsCount"
> {
  names: Localized;
  descriptions: Localized;
  shortDescriptions: Localized;
  links: ProductLinks;
  category: CategoryPath | null;
  images: ProductImage[];
  attributeValues: AttributeValue[];
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  commentsCount: number;
  questionsCount: number;
}

/** Fields the admin can edit in the product modal. */
export interface ProductPatch {
  names?: Partial<Localized>;
  descriptions?: Partial<Localized>;
  shortDescriptions?: Partial<Localized>;
  /** product ids in the wanted order; a kind that isn't here stays as it is */
  links?: Partial<Record<LinkKind, number[]>>;
  attributeValues?: AttributeValue[];
  categoryId?: number | null;
  brandId?: number | null;
  badgeId?: number | null;
  publishStatus?: PublishStatus;
  isActive?: boolean;
  purchasable?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: number;
  brand?: number;
  badge?: number;
  unit?: Unit;
  publishStatus?: PublishStatus;
  isActive?: boolean;
  inStock?: boolean;
  hasDiscount?: boolean;
  purchasable?: boolean;
  erpActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  from?: string;
  to?: string;
}

/** GET /admin/products/stats/ */
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  discounted: number;
}

export type ProductSort =
  "-created_at" | "created_at" | "-price" | "price" | "-quantity" | "quantity" | "name" | "-name";
