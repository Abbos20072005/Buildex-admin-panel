import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { axisMoney, niceCeil } from "@/features/dashboard";
import { formatMoney, formatNumber } from "@/shared/lib/format";
import { brand } from "@/theme";
import type { ChartPoint } from "../model/types";

const WIDTH = 760;
const HEIGHT = 250;
const PAD = { top: 12, right: 44, bottom: 26, left: 52 };
const TICKS = 4;

/**
 * Revenue (left axis) and orders (right axis) per day, and the previous period's revenue as a
 * dashed line. Hovering a day shows its numbers.
 */
export function RevenueChart({ points, compare }: { points: ChartPoint[]; compare: boolean }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState<number | null>(null);

  const maxRevenue = niceCeil(
    Math.max(0, ...points.flatMap((p) => [p.revenue, compare ? (p.previousRevenue ?? 0) : 0])),
  );
  const maxOrders = niceCeil(Math.max(0, ...points.map((p) => p.orders)));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) =>
    PAD.left + (points.length > 1 ? (index / (points.length - 1)) * innerW : innerW / 2);
  const yRevenue = (value: number) => PAD.top + innerH - (value / maxRevenue) * innerH;
  const yOrders = (value: number) => PAD.top + innerH - (value / maxOrders) * innerH;
  const line = (values: (number | null)[], y: (value: number) => number) =>
    values
      .map((value, index) => (value === null ? null : `${x(index)},${y(value)}`))
      .filter(Boolean)
      .join(" ");
  const step = Math.max(1, Math.ceil(points.length / 6));
  const current = hover === null ? null : points[hover];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const position = (ratio * WIDTH - PAD.left) / innerW;
          setHover(
            Math.min(points.length - 1, Math.max(0, Math.round(position * (points.length - 1)))),
          );
        }}
      >
        {Array.from({ length: TICKS + 1 }, (_, i) => {
          const gridY = PAD.top + (innerH / TICKS) * i;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={gridY}
                y2={gridY}
                className="stroke-slate-200"
              />
              <text
                x={PAD.left - 6}
                y={gridY + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {axisMoney(maxRevenue - (maxRevenue / TICKS) * i)}
              </text>
              <text
                x={WIDTH - PAD.right + 6}
                y={gridY + 4}
                textAnchor="start"
                className="fill-slate-400 text-[10px]"
              >
                {formatNumber(Math.round(maxOrders - (maxOrders / TICKS) * i))}
              </text>
            </g>
          );
        })}

        {points.map((point, index) =>
          index % step === 0 ? (
            <text
              key={point.date}
              x={x(index)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              {dayjs(point.date).format("DD.MM")}
            </text>
          ) : null,
        )}

        {compare && (
          <polyline
            fill="none"
            className="stroke-slate-400"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            points={line(
              points.map((p) => p.previousRevenue),
              yRevenue,
            )}
          />
        )}
        <polyline
          fill="none"
          stroke={brand.primary}
          strokeOpacity={0.45}
          strokeWidth={2}
          strokeLinejoin="round"
          points={line(
            points.map((p) => p.orders),
            yOrders,
          )}
        />
        <polyline
          fill="none"
          stroke={brand.primary}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line(
            points.map((p) => p.revenue),
            yRevenue,
          )}
        />

        {hover !== null && current && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              className="stroke-slate-300"
            />
            <circle cx={x(hover)} cy={yRevenue(current.revenue)} r={4} fill={brand.primary} />
          </g>
        )}
      </svg>

      {current && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{ left: `${(x(hover ?? 0) / WIDTH) * 100}%`, transform: "translateX(-50%)" }}
        >
          <div className="font-bold">{dayjs(current.date).format("DD.MM.YYYY")}</div>
          <div className="mt-1 text-slate-600">
            {t("analytics.chart.revenue")}: <b>{formatMoney(current.revenue)}</b>
          </div>
          <div className="text-slate-600">
            {t("analytics.chart.orders")}: <b>{formatNumber(current.orders)}</b>
          </div>
          {compare && current.previousRevenue !== null && (
            <div className="text-slate-500">
              {t("analytics.chart.previous")}: {formatMoney(current.previousRevenue)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
