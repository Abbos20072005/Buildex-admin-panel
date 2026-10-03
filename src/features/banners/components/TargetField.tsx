import { Select } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useTargetOptionsQuery } from "../hooks/queries";
import type { BannerTarget, LinkType } from "../model/types";

interface Props {
  linkType: LinkType;
  /** "product:97" — the model and id of the chosen object */
  value?: string;
  onChange?: (value: string) => void;
  /** the saved target, shown while it is not in the search results */
  current: BannerTarget | null;
}

/** "Manzil": a searchable list of categories / products / badges / brands. */
export function TargetField({ linkType, value, onChange, current }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const targets = useTargetOptionsQuery(linkType, useDebouncedValue(search, 300));

  const options = useMemo(() => {
    const found = targets.data ?? [];
    const toOption = (item: { key: string; name: string }) => ({
      value: item.key,
      label: item.name,
    });
    const groups = [...new Set(found.map((item) => item.group))];
    const list =
      linkType === "category"
        ? groups.map((group) => ({
            label: t(`banners.targetGroups.${group}`),
            options: found.filter((item) => item.group === group).map(toOption),
          }))
        : found.map(toOption);

    // the saved target may not be among the results — keep it selectable
    if (current && value === `${current.model}:${current.id}`) {
      const key = `${current.model}:${current.id}`;
      if (!found.some((item) => item.key === key)) {
        return [{ value: key, label: current.name }, ...list];
      }
    }
    return list;
  }, [targets.data, linkType, current, value, t]);

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      loading={targets.isFetching}
      showSearch={{ filterOption: false, onSearch: setSearch }}
      placeholder={t("banners.choose")}
      notFoundContent={t("banners.nothingFound")}
    />
  );
}
