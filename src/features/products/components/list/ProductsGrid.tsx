import { Empty, Pagination, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { PAGE_SIZES } from "../../model/constants";
import type { Product } from "../../model/types";
import {
  ErpMark,
  ProductPrice,
  ProductStock,
  ProductThumb,
  PublishStatusTag,
} from "../ProductBits";

interface Props {
  products: Product[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (id: number) => void;
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: (id: number) => void }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onOpen(product.id)}
      className="flex min-w-0 cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand hover:shadow-sm"
    >
      <div className="relative">
        <ProductThumb src={product.image} alt={product.name} className="aspect-[4/3] w-full" />
        <div className="absolute top-2 left-2 flex gap-1">
          <PublishStatusTag status={product.publishStatus} />
        </div>
      </div>

      <div className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 font-semibold">
        {product.name}
      </div>
      <div className="mt-0.5 truncate font-mono text-xs text-slate-400">
        {product.code ?? product.articul ?? `ID ${product.id}`}
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="inline-flex items-center gap-1.5">
          <ProductPrice product={product} />
          <ErpMark />
        </span>
        <span className="text-xs text-slate-500">
          {t("products.columns.stock")} <ProductStock product={product} />
        </span>
      </div>
    </button>
  );
}

/** Card view of the product list. */
export function ProductsGrid({
  products,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onOpen,
}: Props) {
  const { t } = useTranslation();

  return (
    <Spin spinning={loading}>
      {products.length === 0 && !loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12">
          <Empty description={t("common.noData")} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={onOpen} />
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={PAGE_SIZES}
          showTotal={(count, [from, to]) => `${from}–${to} / ${count}`}
          onChange={onPageChange}
        />
      </div>
    </Spin>
  );
}
