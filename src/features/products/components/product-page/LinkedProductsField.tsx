import { TrashIcon } from "@/shared/icons";
import { Button, Select, Tag } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { toLinkedProduct } from "../../api/products.mappers";
import { useLinkableProductsQuery } from "../../hooks/queries";
import { MAX_LINKED_PRODUCTS, type LinkedProduct } from "../../model/types";
import { ProductThumb } from "../ProductBits";

interface Props {
  /** form-item props */
  value?: LinkedProduct[];
  onChange?: (value: LinkedProduct[]) => void;
  /** the product being edited — it can't be linked to itself */
  productId: number;
}

function Price({ item }: { item: LinkedProduct }) {
  const { t } = useTranslation();
  const price =
    item.discountPrice !== null && item.discountPrice < item.price
      ? item.discountPrice
      : item.price;
  return (
    <span className="tabular-nums">
      {formatNumber(price)} {t("common.sum")}
    </span>
  );
}

/** Marks a linked product that can't be bought right now. */
function StateTags({ item }: { item: LinkedProduct }) {
  const { t } = useTranslation();
  return (
    <>
      {!item.isActive && (
        <Tag color="red" variant="filled" className="m-0">
          {t("products.links.inactive")}
        </Tag>
      )}
      {item.quantity <= 0 && (
        <Tag color="orange" variant="filled" className="m-0">
          {t("products.links.soldOut")}
        </Tag>
      )}
    </>
  );
}

/**
 * Antd form control: the products of one kind of link, in the order they were put in.
 * Search adds a product, a drag moves it, the trash removes it.
 */
export function LinkedProductsField({ value = [], onChange, productId }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim(), 300);
  const query = useLinkableProductsQuery(debounced);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const full = value.length >= MAX_LINKED_PRODUCTS;
  const linked = new Set(value.map((item) => item.id));
  const options = (query.data?.items ?? [])
    .filter((product) => product.id !== productId && !linked.has(product.id))
    .map((product) => ({ value: product.id, product }));

  const add = (id: number) => {
    const found = options.find((option) => option.value === id);
    if (found && !full) onChange?.([...value, toLinkedProduct(found.product)]);
    setSearch("");
  };

  const remove = (id: number) => onChange?.(value.filter((item) => item.id !== id));

  const drop = (targetId: number) => {
    if (dragging !== null && dragging !== targetId) {
      const next = [...value];
      const from = next.findIndex((item) => item.id === dragging);
      const [moved] = next.splice(from, 1);
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
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Select<number | null>
          showSearch={{ filterOption: false, onSearch: setSearch, searchValue: search }}
          value={null}
          disabled={full}
          className="min-w-0 flex-1"
          placeholder={
            full
              ? t("products.links.limitReached", { max: MAX_LINKED_PRODUCTS })
              : t("products.links.search")
          }
          loading={query.isFetching}
          notFoundContent={t("products.links.noResults")}
          onChange={(id) => id !== null && add(id)}
          options={options.map(({ value: id, product }) => ({
            value: id,
            label: (
              <span className="flex items-center gap-2">
                <ProductThumb src={product.image} alt="" className="size-8" />
                <span className="min-w-0">
                  <span className="block truncate">{product.name}</span>
                  <span className="block font-mono text-xs text-slate-400">
                    {product.articul ?? product.code}
                  </span>
                </span>
              </span>
            ),
          }))}
        />
        <span
          className={clsx(
            "shrink-0 text-xs font-semibold tabular-nums",
            full ? "text-amber-700" : "text-slate-500",
          )}
        >
          {t("products.links.limit", { count: value.length, max: MAX_LINKED_PRODUCTS })}
        </span>
      </div>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
          {t("products.links.empty")}
        </div>
      ) : (
        <ul className="m-0 list-none space-y-2 p-0">
          {value.map((item) => (
            <li
              key={item.id}
              draggable
              title={t("products.links.dragHint")}
              onDragStart={() => setDragging(item.id)}
              onDragOver={(event) => {
                event.preventDefault();
                setOver(item.id);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={() => drop(item.id)}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
              className={clsx(
                "flex cursor-grab items-center gap-3 rounded-lg border bg-white p-2",
                over === item.id && dragging !== item.id ? "border-brand" : "border-slate-200",
                dragging === item.id && "opacity-50",
              )}
            >
              <ProductThumb src={item.image} alt="" className="size-12" />
              <div className="min-w-0 flex-1">
                <a
                  href={`/products/${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm font-semibold"
                  draggable={false}
                >
                  {item.name}
                </a>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="font-mono">{item.articul ?? item.code}</span>
                  <Price item={item} />
                  <span className="tabular-nums">{formatNumber(item.quantity)}</span>
                  <StateTags item={item} />
                </div>
              </div>
              <Button
                type="text"
                danger
                icon={<TrashIcon />}
                aria-label={t("products.links.remove")}
                onClick={() => remove(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
