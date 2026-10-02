import type { Query } from "@/shared/api";
import type {
  Attribute,
  AttributeCategory,
  AttributeInput,
  AttributeListFilters,
} from "../model/types";
import type { AttributeCategoryDto, AttributeDto, AttributeWriteDto } from "./attributes.dto";

const text = (value: string | null | undefined) => value ?? "";

function mapCategory(dto: AttributeCategoryDto): AttributeCategory {
  const sub = dto.product_sub_category;
  const parts = [sub?.product_category?.name, sub?.name, dto.name].filter(Boolean);
  return { id: dto.id, name: dto.name, path: parts.join(" / ") };
}

export function mapAttribute(dto: AttributeDto): Attribute {
  const categories = (dto.item_categories ?? []).map(mapCategory);
  return {
    id: dto.id,
    name: dto.name,
    names: { uz: text(dto.name_uz), ru: text(dto.name_ru) },
    valueType: dto.value_type,
    unit: text(dto.unit),
    options: (dto.options ?? []).map((option) => ({
      id: option.id,
      uz: option.value_uz,
      ru: option.value_ru,
    })),
    isFilterable: dto.is_filterable ?? false,
    isActive: dto.is_active ?? true,
    categories,
    categoriesCount: dto.item_categories_count ?? categories.length,
    productsCount: dto.products_count ?? 0,
  };
}

export function filtersToQuery(filters: AttributeListFilters): Query {
  return {
    search: filters.search?.trim() || undefined,
    value_type: filters.valueType,
    is_active: filters.isActive,
    is_filterable: filters.isFilterable,
  };
}

/**
 * The backend ignores `unit` for non-numbers and `options` for non-lists; they are left out
 * here too. Options keep their `id` — a missing id creates a new option, a missing option
 * in the list deletes it.
 */
export function inputToDto(input: AttributeInput): AttributeWriteDto {
  const dto: AttributeWriteDto = {
    name_uz: input.names.uz.trim(),
    name_ru: input.names.ru.trim(),
    value_type: input.valueType,
    is_filterable: input.isFilterable,
    is_active: input.isActive,
  };
  if (input.valueType === "number") dto.unit = input.unit.trim();
  if (input.valueType === "list") {
    dto.options = input.options.map((option) => ({
      ...(option.id ? { id: option.id } : {}),
      value_uz: option.uz.trim(),
      value_ru: option.ru.trim(),
    }));
  }
  return dto;
}
