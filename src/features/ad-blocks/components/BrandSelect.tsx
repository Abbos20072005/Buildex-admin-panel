import { Select } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useBrandSearchQuery } from "../hooks/queries";
import type { BrandRef } from "../model/types";

interface Props {
  /** brand id; empty — the block has no brand */
  value?: number | null;
  onChange?: (value: number | null) => void;
  /** the saved brand, shown while it is not in the search results */
  current: BrandRef | null;
}

/** Optional brand of the block (one brand can have only one block). */
export function BrandSelect({ value, onChange, current }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const brands = useBrandSearchQuery(useDebouncedValue(search, 300));

  const options = useMemo(() => {
    const list = (brands.data ?? []).map((brand) => ({ value: brand.id, label: brand.name }));
    return current && !list.some((option) => option.value === current.id)
      ? [{ value: current.id, label: current.name }, ...list]
      : list;
  }, [brands.data, current]);

  return (
    <Select
      allowClear
      value={value ?? undefined}
      onChange={(next) => onChange?.(next ?? null)}
      options={options}
      loading={brands.isFetching}
      showSearch={{ filterOption: false, onSearch: setSearch }}
      placeholder={t("adBlocks.noBrand")}
      notFoundContent={t("adBlocks.nothingFound")}
    />
  );
}
