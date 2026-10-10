import { api, type Page, type Paginated } from "@/shared/api";
import type {
  AdBlock,
  AdBlockInput,
  AdBlockListParams,
  AdBlockProduct,
  BrandRef,
} from "../model/types";
import type { AdBlockDto, AdBlockProductDto, BrandRefDto } from "./ad-blocks.dto";
import { filtersToQuery, inputToDto, mapAdBlock, mapBrand, mapProduct } from "./ad-blocks.mappers";

export const adBlocksApi = {
  /** GET /admin/adds-brands/ — newest first; the list has `products_count` instead of products */
  async list({ filters, page, pageSize }: AdBlockListParams): Promise<Page<AdBlock>> {
    const data = await api.get<Paginated<AdBlockDto>>("/adds-brands/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: "-created_at",
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapAdBlock) };
  },

  /** GET /admin/adds-brands/{id}/ — with the description and the products */
  async get(id: number): Promise<AdBlock> {
    return mapAdBlock(await api.get<AdBlockDto>(`/adds-brands/${id}/`));
  },

  /** POST /admin/adds-brands/ */
  async create(input: AdBlockInput): Promise<AdBlock> {
    return mapAdBlock(await api.post<AdBlockDto>("/adds-brands/", inputToDto(input)));
  },

  /** PATCH /admin/adds-brands/{id}/ */
  async update(id: number, input: AdBlockInput): Promise<AdBlock> {
    return mapAdBlock(await api.patch<AdBlockDto>(`/adds-brands/${id}/`, inputToDto(input)));
  },

  /** DELETE — only the block goes, products and brand stay */
  async remove(id: number): Promise<void> {
    await api.delete(`/adds-brands/${id}/`);
  },

  /** Products for the picker, found by name or code */
  async searchProducts(search: string): Promise<AdBlockProduct[]> {
    const data = await api.get<Paginated<AdBlockProductDto>>("/products/", {
      search: search.trim() || undefined,
      page_size: 20,
    });
    return data.results.map(mapProduct);
  },

  /** Brands for the select */
  async searchBrands(search: string): Promise<BrandRef[]> {
    const data = await api.get<Paginated<BrandRefDto>>("/brands/", {
      search: search.trim() || undefined,
      page_size: 30,
    });
    return data.results.map(mapBrand);
  },
  /** PATCH /adds-brands/{id}/ { is_visible } — one field, used by the bulk status change */
  async setVisible(id: number, value: boolean): Promise<void> {
    await api.patch(`/adds-brands/${id}/`, { is_visible: value });
  },
};
