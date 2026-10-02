import { brand } from "@/theme";
import { axisMoney, niceCeil } from "../../lib/format";

interface Series {
  key: string;
  color: string;
  values: number[];
}

interface Props {
  labels: string[];
  series: Series[];
  /** which labels are printed under the axis (every nth) */
  labelEvery?: number;
}

const WIDTH = 520;
const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 40 };
const TICKS = 5;

/** Two or more lines over the same x labels, with a grid and a marker on the highest point. */
export function LineChart({ labels, series, labelEvery = 1 }: Props) {
  const max = niceCeil(Math.max(0, ...series.flatMap((line) => line.values)));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) =>
    PAD.left + (labels.length > 1 ? (index / (labels.length - 1)) * innerW : innerW / 2);
  const y = (value: number) => PAD.top + innerH - (value / max) * innerH;

  const first = series[0];
  const peak = first ? first.values.indexOf(Math.max(...first.values)) : -1;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={labels.join(", ")}
    >
      {Array.from({ length: TICKS }, (_, i) => {
        const value = (max / (TICKS - 1)) * i;
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
              {axisMoney(value)}
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

      {series.map((line) => (
        <polyline
          key={line.key}
          fill="none"
          stroke={line.color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line.values.map((value, index) => `${x(index)},${y(value)}`).join(" ")}
        />
      ))}

      {first && peak >= 0 && first.values[peak] > 0 && (
        <circle
          cx={x(peak)}
          cy={y(first.values[peak])}
          r={4.5}
          fill={first.color}
          stroke={brand.white}
          strokeWidth={2}
        />
      )}
    </svg>
  );
}
