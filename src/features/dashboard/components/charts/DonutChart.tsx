import { useState, type MouseEvent, type ReactNode } from "react";
import { formatNumber } from "@/shared/lib/format";

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  /** a Tailwind `text-*` class — the segment is drawn in `currentColor` */
  colorClass: string;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Ring chart with a centre caption. Segments start at 12 o'clock and go clockwise; hover shows the value. */
export function DonutChart({
  segments,
  children,
}: {
  segments: DonutSegment[];
  children?: ReactNode;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const [hover, setHover] = useState<{ segment: DonutSegment; x: number; y: number } | null>(null);
  let offset = 0;

  const onMove = (segment: DonutSegment) => (event: MouseEvent<SVGCircleElement>) => {
    const box = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (box) setHover({ segment, x: event.clientX - box.left, y: event.clientY - box.top });
  };

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
                strokeWidth={hover?.segment.key === segment.key ? 17 : 14}
                stroke="currentColor"
                className={`${segment.colorClass} transition-[stroke-width]`}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
                onMouseMove={onMove(segment)}
                onMouseLeave={() => setHover(null)}
              />
            );
            offset += length;
            return circle;
          })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        {children}
      </div>
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          <div className="flex items-center gap-1.5">
            <span className={`size-2 rounded-sm bg-current ${hover.segment.colorClass}`} />
            {hover.segment.label}
          </div>
          <div className="font-bold tabular-nums">
            {formatNumber(hover.segment.value)} · {((hover.segment.value / total) * 100).toFixed(1)}
            %
          </div>
        </div>
      )}
    </div>
  );
}
