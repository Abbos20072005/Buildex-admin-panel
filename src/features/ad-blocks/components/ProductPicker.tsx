import { CloseIcon } from "@/shared/icons";
import { Button, Select, Tag } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatMoney } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useProductSearchQuery } from "../hooks/queries";
import type { AdBlockProduct } from "../model/types";

interface Props {
  value?: AdBlockProduct[];
  onChange?: (products: AdBlockProduct[]) => void;
  /** the list can be reordered by dragging (the order is kept by the API) */
  sortable?: boolean;
  /** a line under the list, e.g. what the order means */
  hint?: string;
}

/**
 * Search a product by name or code to add it; the chosen ones are listed below with "remove"
 * and, when `sortable`, can be dragged into the wanted order.
 */
export function ProductPicker({ value = [], onChange, sortable, hint }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const found = useProductSearchQuery(useDebouncedValue(search, 300));
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const taken = new Set(value.map((product) => product.id));
  const candidates = (found.data ?? []).filter((product) => !taken.has(product.id));

  const drop = (targetId: number) => {
    if (dragging !== null && dragging !== targetId) {
      const next = [...value];
      const [moved] = next.splice(
        next.findIndex((item) => item.id === dragging),
        1,
      );
      next.splice(
        next.findIndex((item) => item.id === targetId),
        0,
        moved,
      );
      onChange?.(next);
    }
    setDragging(null);
    setOver(null);
  };

  return (
    <div>
      <Select<number | null>
        value={null}
        placeholder={t("adBlocks.addProduct")}
        loading={found.isFetching}
        showSearch={{ filterOption: false, onSearch: setSearch }}
        notFoundContent={t("adBlocks.nothingFound")}
        options={candidates.map((product) => ({
          value: product.id,
          label: (
            <span className="flex items-center justify-between gap-3">
              <span className="truncate">{product.name}</span>
              <span className="shrink-0 text-xs text-slate-400">{product.productCode}</span>
            </span>
          ),
        }))}
        onSelect={(id) => {
          const product = candidates.find((item) => item.id === id);
          if (product) onChange?.([...value, product]);
        }}
      />

      <ul className="m-0 mt-3 list-none divide-y divide-slate-100 rounded-xl border border-slate-200 p-0">
        {value.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-400">
            {t("adBlocks.noProducts")}
          </li>
        )}
        {value.map((product, index) => (
          <li
            key={product.id}
            draggable={sortable}
            onDragStart={sortable ? () => setDragging(product.id) : undefined}
            onDragOver={
              sortable
                ? (event) => {
                    event.preventDefault();
                    setOver(product.id);
                  }
                : undefined
            }
            onDragLeave={sortable ? () => setOver(null) : undefined}
            onDrop={sortable ? () => drop(product.id) : undefined}
            onDragEnd={
              sortable
                ? () => {
                    setDragging(null);
                    setOver(null);
                  }
                : undefined
            }
            className={clsx(
              "flex items-center gap-3 px-4 py-2.5",
              sortable && "cursor-grab",
              over === product.id && dragging !== product.id && "bg-surface-alt",
              dragging === product.id && "opacity-50",
            )}
          >
            {sortable && (
              <span className="w-5 shrink-0 text-center text-xs font-semibold text-slate-400 tabular-nums">
                {index + 1}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{product.name}</div>
              <div className="text-xs text-slate-500">{product.productCode}</div>
            </div>
            {!product.isActive && (
              <Tag variant="filled" className="m-0">
                {t("adBlocks.productInactive")}
              </Tag>
            )}
            <div className="shrink-0 text-right text-sm">
              {product.price !== null && (
                <span
                  className={product.discountPrice ? "text-xs text-slate-400 line-through" : ""}
                >
                  {formatMoney(product.price)}
                </span>
              )}
              {product.discountPrice ? (
                <div className="font-semibold">{formatMoney(product.discountPrice)}</div>
              ) : null}
            </div>
            <Button
              type="text"
              size="small"
              icon={<CloseIcon />}
              aria-label={t("common.delete")}
              onClick={() => onChange?.(value.filter((item) => item.id !== product.id))}
            />
          </li>
        ))}
      </ul>
      {sortable && hint && value.length > 1 && (
        <div className="mt-2 text-xs text-slate-500">{hint}</div>
      )}
    </div>
  );
}
