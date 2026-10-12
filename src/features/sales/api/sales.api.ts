import { api, type Page, type Paginated } from "@/shared/api";
import type { Sale, SaleFiles, SaleInput, SaleListParams } from "../model/types";
import type { SaleDto } from "./sales.dto";
import { filesToFormData, filtersToQuery, inputToDto, mapSale } from "./sales.mappers";

export const salesApi = {
  /** GET /admin/sales/ — newest first */
  async list({ filters, page, pageSize }: SaleListParams): Promise<Page<Sale>> {
    const data = await api.get<Paginated<SaleDto>>("/sales/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: "-created_at",
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapSale) };
  },

  /** GET /admin/sales/{id}/ — with the products */
  async get(id: number): Promise<Sale> {
    return mapSale(await api.get<SaleDto>(`/sales/${id}/`));
  },

  /** POST /admin/sales/, then the pictures in a PATCH (when there are any) */
  async create(input: SaleInput, files: SaleFiles): Promise<Sale> {
    const created = await api.post<SaleDto>("/sales/", inputToDto(input));
    if (!files.image && !files.bgImage) return mapSale(created);
    return mapSale(await api.patch<SaleDto>(`/sales/${created.id}/`, filesToFormData(files)));
  },

  /** PATCH /admin/sales/{id}/, then the pictures */
  async update(id: number, input: SaleInput, files: SaleFiles): Promise<Sale> {
    const saved = await api.patch<SaleDto>(`/sales/${id}/`, inputToDto(input));
    if (!files.image && !files.bgImage) return mapSale(saved);
    return mapSale(await api.patch<SaleDto>(`/sales/${id}/`, filesToFormData(files)));
  },

  /** DELETE — the products stay */
  async remove(id: number): Promise<void> {
    await api.delete(`/sales/${id}/`);
  },

  /** PATCH { is_visible } — one field, used by the bulk status change */
  async setVisible(id: number, value: boolean): Promise<void> {
    await api.patch(`/sales/${id}/`, { is_visible: value });
  },
};
