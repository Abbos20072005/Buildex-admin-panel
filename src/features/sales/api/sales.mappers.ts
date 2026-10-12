import type { Query } from "@/shared/api";
import type { Sale, SaleFilters, SaleFiles, SaleInput, SaleProduct } from "../model/types";
import type { SaleDto, SaleProductDto } from "./sales.dto";

export const mapSaleProduct = (dto: SaleProductDto): SaleProduct => ({
  id: dto.id,
  name: dto.name,
  productCode: dto.product_code ?? "",
  price: dto.price ?? null,
  discountPrice: dto.discount_price ?? null,
  isActive: dto.is_active ?? true,
});

export const mapSale = (dto: SaleDto): Sale => ({
  id: dto.id,
  name: dto.name,
  image: dto.image || null,
  bgImage: dto.bg_image || null,
  discountFrom: dto.discount_from,
  discountTo: dto.discount_to,
  isMain: dto.is_main,
  isVisible: dto.is_visible,
  productsCount: dto.products_count ?? dto.products?.length ?? 0,
  products: (dto.products ?? []).map(mapSaleProduct),
  createdAt: dto.created_at,
});

export const filtersToQuery = (filters: SaleFilters): Query => ({
  search: filters.search?.trim() || undefined,
  is_visible: filters.isVisible,
  is_main: filters.isMain,
});

/** `products` replaces the whole list: `[{ id }]`, an empty list is accepted. */
export const inputToDto = (input: SaleInput) => ({
  name: input.name.trim(),
  discount_from: input.discountFrom,
  discount_to: input.discountTo,
  is_main: input.isMain,
  is_visible: input.isVisible,
  products: input.productIds.map((id) => ({ id })),
});

/** The pictures go in their own multipart PATCH (the fields above are sent as JSON). */
export function filesToFormData(files: SaleFiles): FormData {
  const form = new FormData();
  if (files.image) form.append("image", files.image);
  if (files.bgImage) form.append("bg_image", files.bgImage);
  return form;
}
