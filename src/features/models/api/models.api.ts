import { api, type Page, type Paginated } from "@/shared/api";
import type {
  ProductModel,
  ProductModelInput,
  ProductModelListFilters,
  ProductModelSort,
} from "../model/types";
import type { ProductModelDto } from "./models.dto";
import { filtersToQuery, inputToDto, mapModel } from "./models.mappers";

export interface ModelsListParams {
  filters: ProductModelListFilters;
  page: number;
  pageSize: number;
  sort?: ProductModelSort;
}

type ValidInput = ProductModelInput & { brandId: number };

export const modelsApi = {
  /** GET /admin/product-models/ — server-side search and pagination */
  async list({
    filters,
    page,
    pageSize,
    sort = "name",
  }: ModelsListParams): Promise<Page<ProductModel>> {
    const data = await api.get<Paginated<ProductModelDto>>("/product-models/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: sort,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapModel) };
  },

  /** POST /admin/product-models/ */
  async create(input: ValidInput): Promise<ProductModel> {
    return mapModel(await api.post<ProductModelDto>("/product-models/", inputToDto(input)));
  },

  /** PATCH /admin/product-models/{id}/ — the brand of a model with products can't change */
  async update(id: number, input: ValidInput): Promise<ProductModel> {
    return mapModel(await api.patch<ProductModelDto>(`/product-models/${id}/`, inputToDto(input)));
  },

  /** DELETE — refused while the model has products (deactivate it instead) */
  async remove(id: number): Promise<void> {
    await api.delete(`/product-models/${id}/`);
  },
  /** PATCH /product-models/{id}/ { is_active } — one field, used by the bulk status change */
  async setActive(id: number, value: boolean): Promise<void> {
    await api.patch(`/product-models/${id}/`, { is_active: value });
  },
};
