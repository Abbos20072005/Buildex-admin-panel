import type { Query } from "@/shared/api";
import type { Brand, BrandInput, BrandListFilters } from "../model/types";
import type { BrandDto } from "./brands.dto";

const text = (value: string | null | undefined) => value ?? "";

export function mapBrand(dto: BrandDto): Brand {
  return {
    id: dto.id,
    name: dto.name,
    names: { uz: text(dto.name_uz), ru: text(dto.name_ru) },
    descriptions: { uz: text(dto.description_uz), ru: text(dto.description_ru) },
    country: text(dto.country),
    image: dto.image || null,
    isVisible: dto.is_visible ?? true,
    code: dto.code || null,
    productsCount: dto.products_count ?? 0,
  };
}

export function filtersToQuery(filters: BrandListFilters): Query {
  return {
    search: filters.search?.trim() || undefined,
    is_visible: filters.isVisible,
  };
}

/**
 * One "Nomi" field feeds the Russian name (required by the API). The Uzbek name follows it
 * unless the brand already has a different Uzbek name — then that one is kept.
 */
export function inputToFields(
  input: BrandInput,
  current?: Brand,
): Record<string, string | boolean> {
  const name = input.name.trim();
  const keepUz = !!current && !!current.names.uz && current.names.uz !== current.names.ru;
  return {
    name_ru: name,
    name_uz: keepUz ? current.names.uz : name,
    description_uz: input.descriptions.uz.trim(),
    description_ru: input.descriptions.ru.trim(),
    country: input.country.trim(),
    is_visible: input.isVisible,
    // an empty 1C code would collide with other brands (it is unique), so it is sent only when set
    ...(input.code.trim() ? { code: input.code.trim() } : {}),
  };
}

/** multipart/form-data — needed when a logo is uploaded (required on create). */
export function toFormData(
  fields: Record<string, string | boolean>,
  image: File | undefined,
): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
  if (image) form.append("image", image);
  return form;
}
