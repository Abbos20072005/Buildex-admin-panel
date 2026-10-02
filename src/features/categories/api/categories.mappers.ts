import { ROOT_PARENT } from "../model/constants";
import type {
  CategoryAttributeRef,
  CategoryFiles,
  CategoryFormValues,
  CategoryItem,
  CategoryLevel,
  CategoryParentOption,
} from "../model/types";
import type { CategoryAttributeDto, CategoryDto } from "./categories.dto";

const text = (value: string | null | undefined) => value ?? "";

export function mapItem(dto: CategoryDto, level: CategoryLevel): CategoryItem {
  const sub = dto.product_sub_category;
  const parent = dto.product_category ?? sub;
  return {
    id: dto.id,
    level,
    name: text(dto.name),
    names: { uz: text(dto.name_uz), ru: text(dto.name_ru) },
    slug: text(dto.slug),
    code: dto.code ?? null,
    position: dto.position ?? 0,
    metaTitle: { uz: text(dto.meta_title_uz), ru: text(dto.meta_title_ru) },
    metaDescription: { uz: text(dto.meta_description_uz), ru: text(dto.meta_description_ru) },
    showOnSite: dto.show_on_site ?? true,
    showInApp: dto.show_in_app ?? true,
    isActive: dto.is_active ?? true,
    image: dto.image || null,
    icon: dto.icon || null,
    productsCount: dto.products_count ?? 0,
    filtersCount: dto.filters_count ?? 0,
    childrenCount: dto.children_count ?? 0,
    parentId: parent?.id ?? null,
    parentPath: [sub?.product_category?.name, level === 3 ? sub?.name : dto.product_category?.name]
      .filter(Boolean)
      .join(" / "),
  };
}

export const mapCategoryAttribute = (dto: CategoryAttributeDto): CategoryAttributeRef => ({
  id: dto.id,
  name: dto.name,
  valueType: dto.value_type,
  unit: text(dto.unit),
  isFilterable: dto.is_filterable ?? false,
});

/** Parent choices from the first two levels, labelled with their path. */
export function parentOptions(
  categories: CategoryItem[],
  subCategories: CategoryItem[],
): CategoryParentOption[] {
  const name = (item: CategoryItem) => item.names.uz || item.name || item.names.ru;
  return [
    ...categories.map((item): CategoryParentOption => ({
      key: `1:${item.id}`,
      level: 1,
      id: item.id,
      label: name(item),
    })),
    ...subCategories.map((item): CategoryParentOption => ({
      key: `2:${item.id}`,
      level: 2,
      id: item.id,
      label: [item.parentPath, name(item)].filter(Boolean).join(" / "),
    })),
  ];
}

/**
 * multipart/form-data: the same body works with and without files. The parent goes as a bare
 * pk (`product_category` for sub categories, `product_sub_category` for item categories).
 */
export function toFormData(
  level: CategoryLevel,
  values: CategoryFormValues,
  files: CategoryFiles,
  parentId: number | null,
): FormData {
  const form = new FormData();
  const set = (key: string, value: string | boolean) => form.append(key, String(value));

  set("name_uz", values.names.uz.trim());
  set("name_ru", values.names.ru.trim());
  // an empty slug is generated from the Uzbek name by the backend
  set("slug", (values.slug ?? "").trim());
  if (values.code?.trim()) set("code", values.code.trim());
  set("meta_title_uz", values.metaTitle.uz ?? "");
  set("meta_title_ru", values.metaTitle.ru ?? "");
  set("meta_description_uz", values.metaDescription.uz ?? "");
  set("meta_description_ru", values.metaDescription.ru ?? "");
  set("show_on_site", values.showOnSite);
  set("show_in_app", values.showInApp);
  set("is_active", values.isActive);

  if (level === 2 && parentId !== null) set("product_category", String(parentId));
  if (level === 3 && parentId !== null) set("product_sub_category", String(parentId));
  if (files.image) form.append("image", files.image);
  if (files.icon) form.append("icon", files.icon);
  return form;
}

export const parentKey = (level: CategoryLevel, parentId: number | null): string =>
  parentId === null || level === 1 ? ROOT_PARENT : `${level - 1}:${parentId}`;
