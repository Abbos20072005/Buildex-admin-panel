import type { ApiPeriod, Dashboard, Period } from "../model/types";

/** Spans offered by a chart card, in button order. */
export const PERIODS: Period[] = ["week", "month", "quarter", "half", "year"];

/** Months of the `year` response that make up a 3 / 6 month span. */
const MONTHS: Partial<Record<Period, number>> = { quarter: 3, half: 6 };

/** The period to ask the API for: 3 and 6 months are cut from the year. */
export const toApiPeriod = (period: Period): ApiPeriod =>
  period === "quarter" || period === "half" ? "year" : period;

/** The delivered-orders chart for a span (the last N monthly points of a year for 3 / 6 months). */
export function delivered(data: Dashboard["delivered"], period: Period): Dashboard["delivered"] {
  const size = MONTHS[period];
  if (!size) return data;
  const points = data.points.slice(-size);
  return {
    ...data,
    period,
    points,
    count: points.reduce((sum, point) => sum + point.count, 0),
    revenue: points.reduce((sum, point) => sum + point.revenue, 0),
    // the API compares only whole periods
    change: null,
  };
}

/** The registrations chart for a span. */
export function registrations(
  data: Dashboard["registrations"],
  period: Period,
): Dashboard["registrations"] {
  const size = MONTHS[period];
  if (!size) return data;
  const points = data.points.slice(-size);
  return {
    ...data,
    points,
    total: points.reduce((sum, point) => sum + point.count, 0),
    hasSplit: false,
  };
}
