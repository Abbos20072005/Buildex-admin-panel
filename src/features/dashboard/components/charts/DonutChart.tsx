import type { ReactNode } from "react";

export interface DonutSegment {
  key: string;
  value: number;
  /** a Tailwind `text-*` class — the segment is drawn in `currentColor` */
  colorClass: string;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Ring chart with a centre caption. Segments start at 12 o'clock and go clockwise. */
export function DonutChart({
  segments,
  children,
}: {
  segments: DonutSegment[];
  children?: ReactNode;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let offset = 0;

  return (
    <div className="relative size-36 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img">
        <circle
          cx={50}
          cy={50}
          r={RADIUS}
          fill="none"
          strokeWidth={14}
          className="stroke-slate-100"
        />
        {total > 0 &&
          segments.map((segment) => {
            const length = (segment.value / total) * CIRCUMFERENCE;
            const circle = (
              <circle
                key={segment.key}
                cx={50}
                cy={50}
                r={RADIUS}
                fill="none"
                strokeWidth={14}
                stroke="currentColor"
                className={segment.colorClass}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">{children}</div>
    </div>
  );
}
