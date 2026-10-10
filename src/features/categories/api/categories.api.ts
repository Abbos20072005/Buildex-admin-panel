import { api, type Page, type Paginated } from "@/shared/api";
import { CHILD_FILTER, LEVEL_ENDPOINT } from "../model/constants";
import type {
  CategoryAttributeRef,
  CategoryFiles,
  CategoryFormValues,
  CategoryItem,
  CategoryLevel,
} from "../model/types";
import type { CategoryAttributeDto, CategoryDto } from "./categories.dto";
import { mapCategoryAttribute, mapItem, toFormData } from "./categories.mappers";

export interface CategoriesListParams {
  level: CategoryLevel;
  /** only the children of this category (the level above); omitted — the whole level */
  parentId?: number | null;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** The API returns at most 100 items per page. */
export const MAX_PAGE_SIZE = 100;

export const categoriesApi = {
  /**
   * GET /admin/{categories|sub-categories|item-categories}/ — one level at a time.
   * `?product_category=` / `?product_sub_category=` limit it to the children of one parent.
   */
  async list({
    level,
    parentId,
    search,
    page = 1,
    pageSize = MAX_PAGE_SIZE,
  }: CategoriesListParams): Promise<Page<CategoryItem>> {
    const data = await api.get<Paginated<CategoryDto>>(`/${LEVEL_ENDPOINT[level]}/`, {
      [CHILD_FILTER[level] ?? "_"]: parentId ?? undefined,
      search: search?.trim() || undefined,
      ordering: search?.trim() ? undefined : "position",
      page,
      page_size: pageSize,
    });
    return {
      total: data.count ?? data.results.length,
      items: data.results.map((dto) => mapItem(dto, level)),
    };
  },

  /** POST (id = null) or PATCH of the category; resolves to the saved category */
  async save(
    level: CategoryLevel,
    id: number | null,
    values: CategoryFormValues,
    files: CategoryFiles,
    parentId: number | null,
  ): Promise<CategoryItem> {
    const body = toFormData(level, values, files, parentId);
    const path = `/${LEVEL_ENDPOINT[level]}/`;
    const dto =
      id === null
        ? await api.upload<CategoryDto>(path, body)
        : await api.patch<CategoryDto>(`${path}${id}/`, body);
    return mapItem(dto, level);
  },

  /** PATCH { is_active } — one field, used by the bulk status change */
  async setActive(level: CategoryLevel, id: number, isActive: boolean): Promise<void> {
    await api.patch(`/${LEVEL_ENDPOINT[level]}/${id}/`, { is_active: isActive });
  },

  /** DELETE — refused while the category has products */
  async remove(level: CategoryLevel, id: number): Promise<void> {
    await api.delete(`/${LEVEL_ENDPOINT[level]}/${id}/`);
  },

  /** POST /admin/{level}/reorder/ — ALL children of one parent in the new order */
  async reorder(level: CategoryLevel, ids: number[]): Promise<void> {
    await api.post(`/${LEVEL_ENDPOINT[level]}/reorder/`, { ids });
  },

  /** GET /admin/item-categories/{id}/attributes/ — in the category's order */
  async attributes(id: number): Promise<CategoryAttributeRef[]> {
    const data = await api.get<{ attributes: CategoryAttributeDto[] }>(
      `/item-categories/${id}/attributes/`,
    );
    return data.attributes.map(mapCategoryAttribute);
  },

  /** PUT /admin/item-categories/{id}/attributes/ — replaces the whole list */
  async setAttributes(id: number, attributes: CategoryAttributeRef[]): Promise<void> {
    await api.put(`/item-categories/${id}/attributes/`, {
      attributes: attributes.map((attribute) => ({
        id: attribute.id,
        is_quick_filter: attribute.isQuickFilter,
        max_quick_filters: attribute.maxQuickFilters,
      })),
    });
  },
};
