import { CalendarIcon } from "@/shared/icons";
import { Button, DatePicker, Popover } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { rangeLabel } from "../lib/format";
import type { DateRange } from "../model/types";

const DAY_PRESETS = [7, 30, 90, 365];
const DATE_FORMAT = "YYYY-MM-DD";

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/** Date button: quick spans (7 / 30 / 90 / 365 days) and a "from – to" range of any dates. */
export function DateRangeButton({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const custom = "from" in value;

  const pick = (next: DateRange) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      content={
        <div className="flex w-64 flex-col gap-1">
          {DAY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => pick({ days: preset })}
              className={clsx(
                "cursor-pointer rounded-md border-0 px-3 py-1.5 text-left text-sm hover:bg-slate-100",
                !custom && value.days === preset
                  ? "bg-brand-soft font-semibold text-brand"
                  : "bg-transparent",
              )}
            >
              {t("dashboard.lastDays", { count: preset })}
            </button>
          ))}
          <div className="mt-1 border-t border-slate-100 pt-2">
            <div className="mb-1 px-1 text-xs text-slate-500">{t("dashboard.customRange")}</div>
            <DatePicker.RangePicker
              className={clsx("w-full", custom && "border-brand")}
              allowClear={false}
              placeholder={[t("dashboard.dateFrom"), t("dashboard.dateTo")]}
              value={custom ? [dayjs(value.from), dayjs(value.to)] : null}
              onChange={(dates) =>
                dates?.[0] &&
                dates[1] &&
                pick({ from: dates[0].format(DATE_FORMAT), to: dates[1].format(DATE_FORMAT) })
              }
            />
          </div>
        </div>
      }
    >
      <Button icon={<CalendarIcon />}>{rangeLabel(value)}</Button>
    </Popover>
  );
}
