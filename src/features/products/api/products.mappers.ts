import type { Query } from "@/shared/api";
import type {
  AttributeValue,
  CategoryPath,
  NamedRef,
  Product,
  ProductAttribute,
  ProductDetail,
  ProductFilters,
  ProductPatch,
  ProductStats,
} from "../model/types";
import type {
  AttributeValueDto,
  AttributeValueWriteDto,
  ItemCategoryRefDto,
  NamedRefDto,
  ProductAttributeDto,
  ProductDto,
  ProductListDto,
  ProductStatsDto,
} from "./products.dto";

const LANGS = ["uz", "ru"] as const;

const ref = (dto: NamedRefDto | null | undefined): NamedRef | null =>
  dto ? { id: dto.id, name: dto.name ?? "" } : null;

const text = (value: string | null | undefined) => value ?? "";

/** "Category / Sub category / Item category" */
export function categoryPath(dto: ItemCategoryRefDto | null | undefined): CategoryPath | null {
  if (!dto) return null;
  const sub = dto.product_sub_category;
  const parts = [sub?.product_category?.name, sub?.name, dto.name].filter(Boolean);
  return { id: dto.id, name: dto.name ?? "", path: parts.join(" / ") };
}

export function mapProduct(dto: ProductListDto): Product {
  return {
    id: dto.id,
    name: dto.name ?? "",
    code: dto.product_code ?? null,
    articul: dto.articul_code ?? null,
    barcode: dto.barcode ?? null,
    image: dto.images?.[0]?.image ?? null,
    imagesCount: dto.images?.length ?? 0,
    brand: ref(dto.brand),
    badge: ref(dto.badge),
    category: ref(dto.product_item_category),
    price: Number(dto.price ?? 0),
    discountPrice: dto.discount_price != null ? Number(dto.discount_price) : null,
    discount: dto.discount ?? null,
    unit: dto.unit ?? "pcs",
    quantity: dto.quantity ?? 0,
    rating: Number(dto.rating ?? 0),
    commentsCount: dto.comments_quantity ?? 0,
    isActive: dto.is_active ?? true,
    erpActive: dto.erp_active ?? false,
    publishStatus: dto.publish_status ?? "draft",
    purchasable: dto.purchasable ?? false,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapAttribute(dto: ProductAttributeDto): ProductAttribute {
  return {
    id: dto.id,
    name: dto.name,
    valueType: dto.value_type,
    unit: text(dto.unit),
    options: (dto.options ?? []).map((option) => ({
      id: option.id,
      uz: option.value_uz,
      ru: option.value_ru,
    })),
    isFilterable: dto.is_filterable ?? false,
  };
}

function mapAttributeValue(dto: AttributeValueDto): AttributeValue {
  return {
    attribute: {
      id: dto.attribute.id,
      name: dto.attribute.name,
      valueType: dto.attribute.value_type,
      unit: text(dto.attribute.unit),
    },
    uz: dto.value_uz,
    ru: dto.value_ru,
  };
}

export function mapProductDetail(dto: ProductDto): ProductDetail {
  const base = mapProduct(dto);
  return {
    ...base,
    names: { uz: text(dto.name_uz), ru: text(dto.name_ru) },
    descriptions: { uz: text(dto.description_uz), ru: text(dto.description_ru) },
    shortDescription: text(dto.short_description),
    category: categoryPath(dto.product_item_category),
    images: (dto.images ?? []).map((image) => ({ id: image.id, url: image.image })),
    attributeValues: (dto.attribute_values ?? []).map(mapAttributeValue),
    weight: dto.weight ?? null,
    length: dto.length ?? null,
    width: dto.width ?? null,
    height: dto.height ?? null,
    commentsCount: dto.comments_quantity ?? 0,
    questionsCount: dto.questions_quantity ?? 0,
  };
}

export function mapProductStats(dto: ProductStatsDto): ProductStats {
  return {
    total: dto.total ?? 0,
    active: dto.active ?? 0,
    inactive: dto.inactive ?? 0,
    outOfStock: dto.out_of_stock ?? 0,
    discounted: dto.discounted ?? 0,
  };
}

export function filtersToQuery(filters: ProductFilters): Query {
  return {
    search: filters.search,
    category: filters.category,
    brand: filters.brand,
    badge: filters.badge,
    unit: filters.unit,
    publish_status: filters.publishStatus,
    is_active: filters.isActive,
    in_stock: filters.inStock,
    has_discount: filters.hasDiscount,
    purchasable: filters.purchasable,
    erp_active: filters.erpActive,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    from_created: filters.from,
    to_created: filters.to,
  };
}

/**
 * Both texts are required by the API. Numbers and "true"/"false" must be the same in both
 * languages, so a value filled in one language only is copied to the other.
 */
function attributeValueToDto(item: AttributeValue): AttributeValueWriteDto {
  return {
    attribute: item.attribute.id,
    value_uz: item.uz || item.ru,
    value_ru: item.ru || item.uz,
  };
}

export function patchToDto(patch: ProductPatch): Partial<Record<string, unknown>> {
  const dto: Record<string, unknown> = {};
  for (const lang of LANGS) {
    if (patch.names?.[lang] !== undefined) dto[`name_${lang}`] = patch.names[lang];
    if (patch.descriptions?.[lang] !== undefined)
      dto[`description_${lang}`] = patch.descriptions[lang];
  }
  if (patch.shortDescription !== undefined) dto.short_description = patch.shortDescription;
  if (patch.attributeValues) dto.attribute_values = patch.attributeValues.map(attributeValueToDto);
  if (patch.categoryId !== undefined)
    dto.product_item_category = patch.categoryId ? { id: patch.categoryId } : null;
  if (patch.brandId !== undefined) dto.brand = patch.brandId ? { id: patch.brandId } : null;
  if (patch.badgeId !== undefined) dto.badge = patch.badgeId ? { id: patch.badgeId } : null;
  if (patch.publishStatus) dto.publish_status = patch.publishStatus;
  if (patch.isActive !== undefined) dto.is_active = patch.isActive;
  if (patch.purchasable !== undefined) dto.purchasable = patch.purchasable;
  return dto;
}
