import type { Query } from "@/shared/api";
import { readLocalized, writeLocalized } from "@/shared/lib/localized";
import type {
  AdBlock,
  AdBlockFilters,
  AdBlockInput,
  AdBlockProduct,
  BrandRef,
} from "../model/types";
import type { AdBlockDto, AdBlockProductDto, BrandRefDto } from "./ad-blocks.dto";

export const mapProduct = (dto: AdBlockProductDto): AdBlockProduct => ({
  id: dto.id,
  name: dto.name,
  productCode: dto.product_code ?? "",
  price: dto.price ?? null,
  discountPrice: dto.discount_price ?? null,
  isActive: dto.is_active ?? true,
});

export const mapBrand = (dto: BrandRefDto): BrandRef => ({ id: dto.id, name: dto.name });

export const mapAdBlock = (dto: AdBlockDto): AdBlock => ({
  id: dto.id,
  name: dto.name,
  title: dto.title,
  nameL: readLocalized(dto, "name"),
  titleL: readLocalized(dto, "title"),
  description: readLocalized(dto, "description"),
  brand: dto.brand ? mapBrand(dto.brand) : null,
  products: (dto.products ?? []).map(mapProduct),
  productsCount: dto.products_count ?? dto.products?.length ?? 0,
  isVisible: dto.is_visible,
  createdAt: dto.created_at,
});

export const filtersToQuery = (filters: AdBlockFilters): Query => ({
  search: filters.search?.trim() || undefined,
  is_visible: filters.isVisible,
  has_brand: filters.hasBrand,
});

/** `products` replaces the whole list; `brand: null` detaches the brand. */
export const inputToDto = (input: AdBlockInput) => ({
  ...writeLocalized("name", input.name),
  ...writeLocalized("title", input.title),
  ...writeLocalized("description", input.description),
  brand: input.brandId,
  products: input.productIds,
  is_visible: input.isVisible,
});
