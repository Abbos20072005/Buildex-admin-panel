import type { TFunction } from "i18next";
import dayjs from "dayjs";

/**
 * "7 soat", "1 soat 12 daq", "3 kun" — how long ago `from` was, counted from the server's
 * `now` (not the browser clock). A date in the future gives "N kun qoldi".
 */
export function relativeTime(from: string, now: string, t: TFunction): string {
  const minutes = dayjs(now).diff(dayjs(from), "minute");
  const abs = Math.abs(minutes);
  const days = Math.floor(abs / 1440);
  const hours = Math.floor(abs / 60);

  let text: string;
  if (days >= 1) text = t("today.time.days", { count: days });
  else if (hours >= 1) {
    const rest = abs % 60;
    text = rest
      ? t("today.time.hoursMinutes", { hours, minutes: rest })
      : t("today.time.hours", { count: hours });
  } else text = t("today.time.minutes", { count: Math.max(1, abs) });

  return minutes < 0 ? t("today.time.left", { time: text }) : text;
}
