import type { TFunction } from "i18next";
import type { ScheduleDay } from "../model/types";

export const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export const DEFAULT_OPEN = "09:00";
export const DEFAULT_CLOSE = "18:00";

/** A new store: open Monday to Saturday, Sunday off. */
export const defaultSchedule = (): ScheduleDay[] =>
  WEEK_DAYS.map((day) => ({
    day,
    isOpen: day < 6,
    openTime: day < 6 ? DEFAULT_OPEN : null,
    closeTime: day < 6 ? DEFAULT_CLOSE : null,
  }));

/** The API trims nothing: "09:00:00" → "09:00". */
export const hhmm = (value: string | null | undefined): string | null =>
  value ? value.slice(0, 5) : null;

/** Seven days in order, whatever the API sent (a missing day is a day off). */
export function normalizeSchedule(
  days:
    | { day: number; is_open: boolean; open_time: string | null; close_time: string | null }[]
    | null
    | undefined,
): ScheduleDay[] {
  const byDay = new Map((days ?? []).map((item) => [item.day, item]));
  return WEEK_DAYS.map((day) => {
    const item = byDay.get(day);
    const isOpen = !!item?.is_open;
    return {
      day,
      isOpen,
      openTime: isOpen ? hhmm(item?.open_time) : null,
      closeTime: isOpen ? hhmm(item?.close_time) : null,
    };
  });
}

/** An open day needs both times, and the store closes after it opens. */
export function scheduleError(days: ScheduleDay[] | undefined): "times" | "order" | null {
  for (const item of days ?? []) {
    if (!item.isOpen) continue;
    if (!item.openTime || !item.closeTime) return "times";
    if (item.closeTime <= item.openTime) return "order";
  }
  return null;
}

/**
 * A short line for the list: "Du–Sha 09:00–18:00 · Yak dam". Days with the same hours are
 * joined when they follow each other.
 */
export function summarizeSchedule(days: ScheduleDay[], t: TFunction): string {
  const label = (item: ScheduleDay) =>
    item.isOpen ? `${item.openTime}–${item.closeTime}` : t("stores.dayOff");
  const groups: { from: number; to: number; text: string }[] = [];
  for (const item of days) {
    const text = label(item);
    const last = groups.at(-1);
    if (last && last.text === text && last.to === item.day - 1) last.to = item.day;
    else groups.push({ from: item.day, to: item.day, text });
  }
  const dayName = (day: number) => t(`stores.daysShort.${day}`);
  return groups
    .map((group) =>
      group.from === group.to
        ? `${dayName(group.from)} ${group.text}`
        : `${dayName(group.from)}–${dayName(group.to)} ${group.text}`,
    )
    .join(" · ");
}
