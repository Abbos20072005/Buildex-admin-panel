import { Segmented } from "antd";
import { useTranslation } from "react-i18next";
import { PERIODS } from "../lib/spans";
import type { Period } from "../model/types";

interface Props {
  value: Period;
  onChange: (period: Period) => void;
}

/** Week / month / 3 months / 6 months / year switch in a chart card header. */
export function PeriodSwitch({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <Segmented<Period>
      size="small"
      value={value}
      onChange={onChange}
      options={PERIODS.map((period) => ({ value: period, label: t(`dashboard.period.${period}`) }))}
    />
  );
}
