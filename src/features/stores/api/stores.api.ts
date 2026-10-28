import { api, type Page, type Paginated, type Query } from "@/shared/api";
import { normalizeSchedule } from "../lib/schedule";
import { toCoordinate } from "../lib/map";
import type {
  Store,
  StoreFiles,
  StoreFilters,
  StoreInput,
  StoreListParams,
  StoreType,
} from "../model/types";

/* ---------- raw shapes of /admin/branches/ ---------- */

interface ScheduleDayDto {
  day: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}
interface BranchDto {
  id: number;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  address_uz?: string | null;
  address_ru?: string | null;
  landmark_uz?: string | null;
  landmark_ru?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  branch_type?: StoreType | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  schedule?: ScheduleDayDto[] | null;
  is_open_now?: boolean;
  phone_number?: string | null;
  image?: string | null;
  is_active?: boolean;
  position?: number;
  code?: string | null;
  orders_count?: number;
}

const text = (value: string | null | undefined) => value ?? "";

const mapStore = (dto: BranchDto): Store => ({
  id: dto.id,
  name: dto.name,
  names: { uz: text(dto.name_uz), ru: text(dto.name_ru) },
  addresses: { uz: text(dto.address_uz), ru: text(dto.address_ru) },
  landmarks: { uz: text(dto.landmark_uz), ru: text(dto.landmark_ru) },
  descriptions: { uz: text(dto.description_uz), ru: text(dto.description_ru) },
  type: dto.branch_type ?? 1,
  latitude: toCoordinate(dto.latitude),
  longitude: toCoordinate(dto.longitude),
  schedule: normalizeSchedule(dto.schedule),
  isOpenNow: dto.is_open_now ?? false,
  phone: text(dto.phone_number),
  image: dto.image || null,
  isActive: dto.is_active ?? true,
  position: dto.position ?? 0,
  code: text(dto.code),
  ordersCount: dto.orders_count ?? 0,
});

const filtersToQuery = (filters: StoreFilters): Query => ({
  search: filters.search?.trim() || undefined,
  branch_type: filters.type,
  is_active: filters.isActive,
});

/** A blank optional text goes as `null`: the API clears the field. */
const nullable = (value: string) => value.trim() || null;

/** The phone is typed as the 9 digits after +998. */
const phoneToDto = (digits: string) => (digits.trim() ? `+998${digits.trim()}` : null);

const inputToDto = (input: StoreInput) => ({
  name_uz: nullable(input.names.uz),
  name_ru: input.names.ru.trim(),
  address_uz: nullable(input.addresses.uz),
  address_ru: nullable(input.addresses.ru),
  landmark_uz: input.landmarks.uz.trim(),
  landmark_ru: input.landmarks.ru.trim(),
  description_uz: nullable(input.descriptions.uz),
  description_ru: nullable(input.descriptions.ru),
  branch_type: input.type,
  latitude: input.latitude,
  longitude: input.longitude,
  schedule: input.schedule.map((item) => ({
    day: item.day,
    is_open: item.isOpen,
    open_time: item.isOpen ? item.openTime : null,
    close_time: item.isOpen ? item.closeTime : null,
  })),
  phone_number: phoneToDto(input.phone),
  is_active: input.isActive,
  code: nullable(input.code),
});

/** The picture goes in its own multipart PATCH (the fields above are sent as JSON). */
function imageToFormData(files: StoreFiles): FormData | null {
  if (!files.image) return null;
  const form = new FormData();
  form.append("image", files.image);
  return form;
}

export const storesApi = {
  /** GET /admin/branches/ — by the order of the list (`position`) */
  async list({ filters, page, pageSize }: StoreListParams): Promise<Page<Store>> {
    const data = await api.get<Paginated<BranchDto>>("/branches/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: "position",
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapStore) };
  },

  /** POST /admin/branches/ — then the picture, if one was picked */
  async create(input: StoreInput, files: StoreFiles): Promise<Store> {
    const created = await api.post<BranchDto>("/branches/", inputToDto(input));
    const image = imageToFormData(files);
    return mapStore(
      image ? await api.patch<BranchDto>(`/branches/${created.id}/`, image) : created,
    );
  },

  /** PATCH /admin/branches/{id}/ — then the picture, if a new one was picked */
  async update(id: number, input: StoreInput, files: StoreFiles): Promise<Store> {
    const saved = await api.patch<BranchDto>(`/branches/${id}/`, inputToDto(input));
    const image = imageToFormData(files);
    return mapStore(image ? await api.patch<BranchDto>(`/branches/${id}/`, image) : saved);
  },

  /** PATCH /admin/branches/{id}/ { is_active } — one field, the "Nofaol qilish" action */
  async setActive(id: number, value: boolean): Promise<void> {
    await api.patch(`/branches/${id}/`, { is_active: value });
  },

  /** DELETE /admin/branches/{id}/ — refused for a store that has orders */
  async remove(id: number): Promise<void> {
    await api.delete(`/branches/${id}/`);
  },

  /** POST /admin/branches/reorder/ — `ids` in the new order; their index becomes `position` */
  async reorder(ids: number[]): Promise<void> {
    await api.post("/branches/reorder/", { ids });
  },
};
