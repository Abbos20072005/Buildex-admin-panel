import { Button, Switch, TimePicker } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { DEFAULT_CLOSE, DEFAULT_OPEN } from "../lib/schedule";
import type { ScheduleDay } from "../model/types";

const FORMAT = "HH:mm";

interface Props {
  /** form-item props */
  value?: ScheduleDay[];
  onChange?: (value: ScheduleDay[]) => void;
}

const toTime = (value: string | null) => (value ? dayjs(value, FORMAT) : null);

/**
 * The week of a store: for each day "dam olish" (day off) or the opening and closing times.
 * "Hamma kunlarga qo'llash" copies Monday's hours to the other six days.
 */
export function ScheduleField({ value = [], onChange }: Props) {
  const { t } = useTranslation();

  const patch = (day: number, next: Partial<ScheduleDay>) =>
    onChange?.(value.map((item) => (item.day === day ? { ...item, ...next } : item)));

  const toggle = (item: ScheduleDay, isOpen: boolean) =>
    patch(item.day, {
      isOpen,
      // a day that was just opened gets the usual hours, a closed one loses them
      openTime: isOpen ? (item.openTime ?? DEFAULT_OPEN) : null,
      closeTime: isOpen ? (item.closeTime ?? DEFAULT_CLOSE) : null,
    });

  const applyToAll = () => {
    const first = value.find((item) => item.day === 0);
    if (!first) return;
    onChange?.(
      value.map((item) => ({
        ...item,
        isOpen: first.isOpen,
        openTime: first.openTime,
        closeTime: first.closeTime,
      })),
    );
  };

  return (
    <div>
      <ul className="m-0 list-none divide-y divide-slate-100 rounded-xl border border-slate-200 p-0">
        {value.map((item) => (
          <li key={item.day} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
            <span className="w-28 text-sm font-semibold">{t(`stores.days.${item.day}`)}</span>
            <Switch
              size="small"
              checked={item.isOpen}
              onChange={(checked) => toggle(item, checked)}
              aria-label={t(`stores.days.${item.day}`)}
            />
            {item.isOpen ? (
              <span className="flex items-center gap-2">
                <TimePicker
                  format={FORMAT}
                  minuteStep={5}
                  allowClear={false}
                  needConfirm={false}
                  className="w-28"
                  value={toTime(item.openTime)}
                  onChange={(time) => patch(item.day, { openTime: time?.format(FORMAT) ?? null })}
                />
                <span className="text-slate-400">–</span>
                <TimePicker
                  format={FORMAT}
                  minuteStep={5}
                  allowClear={false}
                  needConfirm={false}
                  className="w-28"
                  value={toTime(item.closeTime)}
                  onChange={(time) => patch(item.day, { closeTime: time?.format(FORMAT) ?? null })}
                />
              </span>
            ) : (
              <span className="text-sm text-slate-400">{t("stores.dayOff")}</span>
            )}
          </li>
        ))}
      </ul>
      <Button type="link" className="px-0" onClick={applyToAll}>
        {t("stores.applyToAll")}
      </Button>
    </div>
  );
}
