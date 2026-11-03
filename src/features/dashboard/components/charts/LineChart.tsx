import { useState, type MouseEvent, type ReactNode } from "react";
import { formatNumber } from "@/shared/lib/format";
import { axisMoney, niceCeil } from "../../lib/format";

interface Series {
  key: string;
  /** shown in the hover tooltip */
  name?: string;
  color: string;
  /** line thickness (default 2.5): lines that run on top of each other get different ones */
  width?: number;
  /** `null` is a gap (no data): nothing is drawn, the line breaks */
  values: (number | null)[];
}

interface Props {
  labels: string[];
  series: Series[];
  /** which labels are printed under the axis (every nth) */
  labelEvery?: number;
  /** drawing size: a wide card gets a wide chart so the text keeps its size */
  width?: number;
  height?: number;
  /** a dot with the value above it on every point of the first line (few points, e.g. 7 days) */
  showValues?: boolean;
  /** text of a value on the dots and in the tooltip (default: a plain number) */
  formatValue?: (value: number) => string;
  /** text of a value on the y axis (default: 15M / 3K) */
  formatAxis?: (value: number) => string;
  /** replaces the body of the hover tooltip */
  renderTooltip?: (index: number) => ReactNode;
}

/** Runs of consecutive points that have a value: a gap ends one run and starts the next. */
function runs(values: (number | null)[]): { index: number; value: number }[][] {
  const result: { index: number; value: number }[][] = [];
  values.forEach((value, index) => {
    if (value === null) return;
    const last = result[result.length - 1];
    if (last && last[last.length - 1].index === index - 1) last.push({ index, value });
    else result.push([{ index, value }]);
  });
  return result;
}

const BASE_PAD = { top: 12, right: 8, bottom: 26, left: 40 };

/** Number of grid lines whose values are whole numbers (0, 1, 2 — not 0, 0.5, 1…). */
const gridLines = (max: number) =>
  [5, 6, 4, 3, 2].find((count) => Number.isInteger(max / (count - 1))) ?? 5;

/** Two or more lines over the same x labels, with a grid and a marker on the highest point. */
export function LineChart({
  labels,
  series,
  labelEvery = 1,
  width = 520,
  height = 220,
  showValues = false,
  formatValue = formatNumber,
  formatAxis = axisMoney,
  renderTooltip,
}: Props) {
  const [active, setActive] = useState<number | null>(null);
  const WIDTH = width;
  const HEIGHT = height;
  // the value above a dot needs room at the top, or the highest one is cut off
  const PAD = { ...BASE_PAD, top: showValues ? 30 : BASE_PAD.top };
  const max = niceCeil(
    Math.max(0, ...series.flatMap((line) => line.values.filter((v): v is number => v !== null))),
  );
  const ticks = gridLines(max);
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) =>
    PAD.left + (labels.length > 1 ? (index / (labels.length - 1)) * innerW : innerW / 2);
  const y = (value: number) => PAD.top + innerH - (value / max) * innerH;

  const first = series[0];
  const firstValues = first?.values.filter((v): v is number => v !== null) ?? [];
  const peak = first && firstValues.length ? first.values.indexOf(Math.max(...firstValues)) : -1;

  const onMove = (event: MouseEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const viewX = ((event.clientX - box.left) / box.width) * WIDTH;
    const ratio = (viewX - PAD.left) / innerW;
    setActive(Math.min(labels.length - 1, Math.max(0, Math.round(ratio * (labels.length - 1)))));
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={labels.join(", ")}
        onMouseMove={onMove}
        onMouseLeave={() => setActive(null)}
      >
        {Array.from({ length: ticks }, (_, i) => {
          const value = (max / (ticks - 1)) * i;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y(value)}
                y2={y(value)}
                className="stroke-slate-200"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={y(value) + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {formatAxis(value)}
              </text>
            </g>
          );
        })}

        {labels.map((label, index) =>
          index % labelEvery === 0 ? (
            <text
              key={`${label}-${index}`}
              x={x(index)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              {label}
            </text>
          ) : null,
        )}

        {series.map((line) =>
          runs(line.values).map((run) =>
            run.length > 1 ? (
              <polyline
                key={`${line.key}-${run[0].index}`}
                fill="none"
                stroke={line.color}
                strokeWidth={line.width ?? 2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={run.map((p) => `${x(p.index)},${y(p.value)}`).join(" ")}
              />
            ) : (
              // a lone point between gaps has no line: a dot keeps it visible
              <circle
                key={`${line.key}-${run[0].index}`}
                cx={x(run[0].index)}
                cy={y(run[0].value)}
                r={3.5}
                fill={line.color}
              />
            ),
          ),
        )}

        {showValues &&
          series.map((line) =>
            line.values.map((value, index) =>
              value === null ? null : (
                <g key={`${line.key}-${index}`}>
                  <circle
                    cx={x(index)}
                    cy={y(value)}
                    r={4}
                    fill={line.color}
                    stroke="var(--ant-color-bg-container)"
                    strokeWidth={2}
                  />
                  <text
                    x={x(index)}
                    y={y(value) - 10}
                    textAnchor="middle"
                    className="fill-slate-800 text-[11px] font-semibold"
                  >
                    {formatValue === formatNumber ? value : formatValue(value)}
                  </text>
                </g>
              ),
            ),
          )}

        {!showValues && first && peak >= 0 && (first.values[peak] ?? 0) > 0 && (
          <circle
            cx={x(peak)}
            cy={y(first.values[peak] ?? 0)}
            r={4.5}
            fill={first.color}
            stroke="var(--ant-color-bg-container)"
            strokeWidth={2}
          />
        )}

        {active !== null && (
          <g className="pointer-events-none">
            <line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              className="stroke-slate-300"
              strokeDasharray="4 4"
            />
            {series.map((line) => {
              const value = line.values[active];
              return value === null || value === undefined ? null : (
                <circle
                  key={line.key}
                  cx={x(active)}
                  cy={y(value)}
                  r={5}
                  fill={line.color}
                  stroke="var(--ant-color-bg-container)"
                  strokeWidth={2}
                />
              );
            })}
          </g>
        )}
      </svg>
      {active !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-lg bg-slate-900 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg dark:text-slate-50"
          style={{
            left: `${(x(active) / WIDTH) * 100}%`,
            transform: `translateX(${active > labels.length / 2 ? "calc(-100% - 12px)" : "12px"})`,
          }}
        >
          <div className="mb-1 text-slate-300">{labels[active]}</div>
          {renderTooltip
            ? renderTooltip(active)
            : series.map((line) => (
                <div key={line.key} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: line.color }} />
                  {line.name && <span className="text-slate-300">{line.name}:</span>}
                  <b className="tabular-nums">{formatValue(line.values[active] ?? 0)}</b>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
