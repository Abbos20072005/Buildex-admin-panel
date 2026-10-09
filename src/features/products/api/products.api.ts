import { api, type Page, type Paginated } from "@/shared/api";
import type {
  CategoryPath,
  NamedRef,
  Product,
  ProductAttribute,
  ProductDetail,
  ProductFilters,
  ProductImage,
  ProductPatch,
  ProductSort,
  ProductStats,
} from "../model/types";
import type {
  ItemCategoryDto,
  ProductDto,
  ProductAttributeDto,
  ProductImageDto,
  ProductListDto,
  ProductStatsDto,
  ReferenceDto,
} from "./products.dto";
import {
  categoryPath,
  filtersToQuery,
  mapAttribute,
  mapProduct,
  mapProductDetail,
  mapProductStats,
  patchToDto,
} from "./products.mappers";

export interface ProductsListParams {
  filters: ProductFilters;
  page: number;
  pageSize: number;
  sort?: ProductSort;
  /** UI language — names come back translated, so it is part of the cache key */
  lang: string;
}

export const productsApi = {
  /** GET /admin/products/ — server-side filtering, search and pagination */
  async list({
    filters,
    page,
    pageSize,
    sort = "-created_at",
  }: ProductsListParams): Promise<Page<Product>> {
    const data = await api.get<Paginated<ProductListDto>>("/products/", {
      ...filtersToQuery(filters),
      page,
      page_size: pageSize,
      ordering: sort,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(mapProduct) };
  },

  /** GET /admin/products/stats/ — counters over the same filters as the list */
  async stats(filters: ProductFilters = {}): Promise<ProductStats> {
    return mapProductStats(
      await api.get<ProductStatsDto>("/products/stats/", filtersToQuery(filters)),
    );
  },

  /** GET /admin/products/{id}/ */
  async get(id: number): Promise<ProductDetail> {
    return mapProductDetail(await api.get<ProductDto>(`/products/${id}/`));
  },

  /** PATCH /admin/products/{id}/ */
  async update(id: number, patch: ProductPatch): Promise<ProductDetail> {
    return mapProductDetail(await api.patch<ProductDto>(`/products/${id}/`, patchToDto(patch)));
  },

  /** POST /admin/products/{id}/images/ (multipart, field `image`) */
  async uploadImage(id: number, file: File): Promise<ProductImage> {
    const form = new FormData();
    form.append("image", file);
    const dto = await api.upload<ProductImageDto>(`/products/${id}/images/`, form);
    return { id: dto.id, url: dto.image };
  },

  /** POST /admin/products/{id}/images/reorder/ — the first id becomes the main photo */
  async reorderImages(id: number, ids: number[]): Promise<void> {
    await api.post(`/products/${id}/images/reorder/`, { ids });
  },

  /** DELETE /admin/products/{id}/images/{image_id}/ */
  async deleteImage(id: number, imageId: number): Promise<void> {
    await api.delete(`/products/${id}/images/${imageId}/`);
  },

  /** Every product matching the filters, page by page (CSV export). */
  async listAll(
    filters: ProductFilters,
    lang: string,
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<Product[]> {
    const pageSize = 100;
    const all: Product[] = [];
    for (let page = 1; page <= 1000; page++) {
      const { items, total } = await productsApi.list({ filters, page, pageSize, lang });
      all.push(...items);
      onProgress?.(all.length, total);
      if (all.length >= total || items.length < pageSize) break;
    }
    return all;
  },
};

const toRefs = (data: Paginated<ReferenceDto>): NamedRef[] =>
  data.results.map(({ id, name }) => ({ id, name }));

/** Dictionaries used by the filters and the catalog card. */
export const productReferencesApi = {
  /** GET /admin/categories/ — top-level categories */
  async categories(): Promise<NamedRef[]> {
    return toRefs(await api.get<Paginated<ReferenceDto>>("/categories/", { page_size: 500 }));
  },

  /** GET /admin/brands/?search= */
  async brands(search = ""): Promise<NamedRef[]> {
    return toRefs(
      await api.get<Paginated<ReferenceDto>>("/brands/", {
        search: search || undefined,
        page_size: 50,
        ordering: "name",
      }),
    );
  },

  /** GET /admin/product-badges/ */
  async badges(): Promise<NamedRef[]> {
    return toRefs(await api.get<Paginated<ReferenceDto>>("/product-badges/", { page_size: 100 }));
  },

  /** GET /admin/item-categories/{id}/attributes/ — attributes of a category, in its order */
  async attributes(itemCategoryId: number): Promise<ProductAttribute[]> {
    const data = await api.get<{ attributes: ProductAttributeDto[] }>(
      `/item-categories/${itemCategoryId}/attributes/`,
    );
    return data.attributes.map(mapAttribute);
  },

  /** GET /admin/item-categories/?search= — the level a product is attached to */
  async itemCategories(search = ""): Promise<CategoryPath[]> {
    const data = await api.get<Paginated<ItemCategoryDto>>("/item-categories/", {
      search: search || undefined,
      page_size: 50,
    });
    return data.results
      .map((item) =>
        categoryPath({
          id: item.id,
          name: item.name,
          product_sub_category: item.product_sub_category
            ? {
                id: item.product_sub_category.id,
                name: item.product_sub_category.name ?? "",
                product_category: item.product_sub_category.product_category ?? null,
              }
            : null,
        }),
      )
      .filter((item): item is CategoryPath => item !== null);
  },
};
