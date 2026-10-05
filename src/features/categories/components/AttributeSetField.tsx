import { ArrowDownIcon, ArrowUpIcon, CheckIcon, CloseIcon } from "@/shared/icons";
import { Button, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAttributesListQuery } from "@/features/attributes";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import type { CategoryAttributeRef } from "../model/types";

interface Props {
  value?: CategoryAttributeRef[];
  onChange?: (value: CategoryAttributeRef[]) => void;
}

/**
 * "Xususiyatlar to'plami": the attributes products of an item category fill in. The order
 * here is the order on the product page (and of the site filters). Works as a `Form.Item` control.
 */
export function AttributeSetField({ value = [], onChange }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const attributes = useAttributesListQuery({
    filters: { search: useDebouncedValue(search, 300) },
    page: 1,
    pageSize: 50,
  });

  const chosen = new Set(value.map((item) => item.id));
  const options = (attributes.data?.items ?? [])
    .filter((attribute) => !chosen.has(attribute.id))
    .map((attribute) => ({
      value: attribute.id,
      label: `${attribute.name} · ${t(`attributes.types.${attribute.valueType}`)}`,
    }));

  const move = (index: number, delta: -1 | 1) => {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange?.(next);
  };

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="grid grid-cols-[28px_1fr_56px_92px] bg-surface-alt px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <span>#</span>
          <span>{t("categories.attribute")}</span>
          <span className="text-center">{t("categories.filter")}</span>
          <span />
        </div>
        {value.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            {t("categories.noAttributes")}
          </div>
        ) : (
          value.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[28px_1fr_56px_92px] items-center border-t border-slate-100 px-3 py-1.5 text-sm"
            >
              <span className="text-slate-400">{index + 1}</span>
              <span className="min-w-0 truncate">
                <span className="font-medium">{item.name}</span>
                <span className="ml-1.5 text-xs text-slate-400">
                  {t(`attributes.types.${item.valueType}`)}
                  {item.unit ? ` · ${item.unit}` : ""}
                </span>
              </span>
              <span className="text-center">
                {item.isFilterable ? <CheckIcon className="text-brand" /> : null}
              </span>
              <span className="flex justify-end">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpIcon />}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownIcon />}
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<CloseIcon />}
                  onClick={() => onChange?.(value.filter((_, i) => i !== index))}
                />
              </span>
            </div>
          ))
        )}
      </div>

      <Select
        className="mt-3 w-full"
        value={null}
        placeholder={`+ ${t("categories.addAttribute")}`}
        showSearch={{ filterOption: false, onSearch: setSearch }}
        loading={attributes.isFetching}
        options={options}
        notFoundContent={t("categories.noAttributeMatches")}
        onSelect={(id) => {
          const attribute = attributes.data?.items.find((item) => item.id === id);
          if (!attribute) return;
          setSearch("");
          onChange?.([
            ...value,
            {
              id: attribute.id,
              name: attribute.name,
              valueType: attribute.valueType,
              unit: attribute.unit,
              isFilterable: attribute.isFilterable,
            },
          ]);
        }}
      />
    </div>
  );
}
