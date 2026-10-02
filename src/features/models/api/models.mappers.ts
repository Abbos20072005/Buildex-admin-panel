import type { Query } from "@/shared/api";
import type { ProductModel, ProductModelInput, ProductModelListFilters } from "../model/types";
import type { ProductModelDto, ProductModelWriteDto } from "./models.dto";

export function mapModel(dto: ProductModelDto): ProductModel {
  return {
    id: dto.id,
    name: dto.name,
    brand: dto.brand ? { id: dto.brand.id, name: dto.brand.name } : null,
    isActive: dto.is_active ?? true,
    productsCount: dto.products_count ?? 0,
  };
}

export function filtersToQuery(filters: ProductModelListFilters): Query {
  return {
    search: filters.search?.trim() || undefined,
    brand: filters.brandId,
    is_active: filters.isActive,
  };
}

/** The editor validates the brand before this is called. */
export function inputToDto(input: ProductModelInput & { brandId: number }): ProductModelWriteDto {
  return {
    name: input.name.trim(),
    brand: { id: input.brandId },
    is_active: input.isActive,
  };
}
