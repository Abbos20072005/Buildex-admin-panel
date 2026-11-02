import { useState, type ReactNode } from "react";
import { axisMoney, niceCeil } from "../../lib/format";

interface Props {
  labels: string[];
  /** `null` is a gap (no data): no bar and no "0" */
  values: (number | null)[];
  color: string;
  height?: number;
  width?: number;
  /** a lighter bar, e.g. for a month that is not over yet */
  faded?: (index: number) => boolean;
  /** text of a value on the y axis (default: 15M / 3K) */
  formatAxis?: (value: number) => string;
  /** the hover tooltip of a bar */
  renderTooltip: (index: number) => ReactNode;
}

const PAD = { top: 12, right: 8, bottom: 26, left: 40 };

/** One bar per label, with a grid and a hover tooltip. */
export function BarChart({
  labels,
  values,
  color,
  height = 220,
  width = 520,
  faded,
  formatAxis = axisMoney,
  renderTooltip,
}: Props) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceCeil(Math.max(0, ...values.filter((v): v is number => v !== null)));
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(labels.length, 1);
  const barW = Math.min(slot * 0.55, 56);
  const centre = (index: number) => PAD.left + slot * index + slot / 2;
  const y = (value: number) => PAD.top + innerH - (value / max) * innerH;
  const ticks = [0, 1, 2, 3, 4];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={labels.join(", ")}
        onMouseLeave={() => setActive(null)}
      >
        {ticks.map((i) => {
          const value = (max / 4) * i;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
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

        {labels.map((label, index) => (
          <g key={`${label}-${index}`} onMouseEnter={() => setActive(index)}>
            {/* a wide invisible column: the hover works on a missing bar too */}
            <rect
              x={PAD.left + slot * index}
              y={PAD.top}
              width={slot}
              height={innerH + PAD.bottom}
              fill="transparent"
            />
            {values[index] !== null && (
              <rect
                x={centre(index) - barW / 2}
                y={y(values[index] as number)}
                width={barW}
                height={innerH - (y(values[index] as number) - PAD.top)}
                rx={4}
                fill={color}
                opacity={faded?.(index) ? 0.5 : active === index ? 1 : 0.9}
              />
            )}
            <text
              x={centre(index)}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
      {active !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-lg bg-slate-900 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg dark:text-slate-50"
          style={{
            left: `${(centre(active) / width) * 100}%`,
            transform: `translateX(${active > labels.length / 2 ? "calc(-100% - 12px)" : "12px"})`,
          }}
        >
          {renderTooltip(active)}
        </div>
      )}
    </div>
  );
}
