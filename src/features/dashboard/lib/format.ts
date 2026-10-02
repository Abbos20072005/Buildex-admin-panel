import type { TFunction } from "i18next";
import dayjs from "dayjs";

/** "12.50" → "12,5": decimal comma, no trailing zeros */
const decimal = (value: number, digits: number) =>
  value
    .toFixed(digits)
    .replace(/\.?0+$/, "")
    .replace(".", ",");

/**
 * A large amount in short form: 1_970_000_000 → { amount: "1,97", unit: "mlrd" },
 * 736_000 → { amount: "736", unit: "ming" }.
 */
export function compactMoney(value: number, t: TFunction): { amount: string; unit: string } {
  const abs = Math.abs(value);
  if (abs >= 1e9) return { amount: decimal(value / 1e9, 2), unit: t("dashboard.units.billion") };
  if (abs >= 1e6) return { amount: decimal(value / 1e6, 2), unit: t("dashboard.units.million") };
  if (abs >= 1e3) return { amount: decimal(value / 1e3, 0), unit: t("dashboard.units.thousand") };
  return { amount: decimal(value, 0), unit: "" };
}

/** Axis label: 15_000_000 → "15M", 3_000 → "3K", 0 → "0" */
export function axisMoney(value: number): string {
  if (value >= 1e6) return `${decimal(value / 1e6, 1)}M`;
  if (value >= 1e3) return `${decimal(value / 1e3, 0)}K`;
  return String(Math.round(value));
}

/** Rounds a maximum up to a "nice" chart ceiling: 12_300_000 → 15_000_000 */
export function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 3, 5, 10].map((n) => n * magnitude).find((n) => n >= value);
  return step ?? magnitude * 10;
}

/** "+12,4%" text without the sign: 12.4 → "12,4%" */
export const percent = (value: number) => `${decimal(Math.abs(value), 1)}%`;

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** Short weekday of a date: Du Se Ch Pa Ju Sh Ya (Monday first) */
export function weekdayLabel(date: string, t: TFunction): string {
  return t(`dashboard.weekdays.${WEEKDAYS[(dayjs(date).day() + 6) % 7]}`);
}

/** "1 – 30 sentabr" for the last `days` days including today. */
export function rangeLabel(days: number): string {
  const end = dayjs();
  const start = end.subtract(days - 1, "day");
  return start.month() === end.month() && start.year() === end.year()
    ? `${start.format("D")} – ${end.format("D MMMM")}`
    : `${start.format("D MMM")} – ${end.format("D MMM")}`;
}
