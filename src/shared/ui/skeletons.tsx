import { clsx } from "@/shared/lib/clsx";

/** A pulsing grey block: the part every skeleton is made of (it follows the light / dark theme). */
export function Bone({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-md bg-slate-200", className)} aria-hidden />;
}

/** A line chart while it loads: the total, the grid, a wave and the legend, as in the real card. */
export function ChartSkeleton({ height = 220, legend = 3 }: { height?: number; legend?: number }) {
  return (
    <div role="status" aria-busy="true">
      <Bone className="h-7 w-28" />
      <div className="relative mt-4" style={{ height }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute inset-x-0 border-t border-slate-200/70"
            style={{ top: `${i * 25}%` }}
          />
        ))}
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full animate-pulse"
        >
          <path
            d="M0 32 L14 24 L28 28 L43 14 L57 20 L71 8 L86 16 L100 10"
            fill="none"
            className="stroke-slate-300"
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3">
        {Array.from({ length: legend }, (_, i) => (
          <Bone key={i} className="h-3.5 w-24" />
        ))}
      </div>
    </div>
  );
}

/** A ring with a legend (a pie chart card). */
export function DonutSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-5" role="status" aria-busy="true">
      <div className="size-36 shrink-0 animate-pulse rounded-full border-[14px] border-slate-200" />
      <div className="min-w-0 flex-1 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Bone className="size-2.5 shrink-0 rounded-sm" />
            <Bone className="h-3.5 flex-1" />
            <Bone className="h-3.5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Rows of a bar list: a name and an amount, a bar under them. */
export function BarListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="m-0 list-none space-y-3 p-0" role="status" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i}>
          <div className="mb-1 flex items-center gap-2">
            <Bone className="h-3.5 flex-1" />
            <Bone className="h-3.5 w-20" />
          </div>
          <Bone className="h-2 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

/** A table while it loads: a header row and the rows. */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3" role="status" aria-busy="true">
      <div className="flex gap-4">
        {Array.from({ length: columns }, (_, i) => (
          <Bone key={i} className={clsx("h-3", i === 0 ? "w-1/3" : "flex-1")} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 border-t border-slate-100 pt-3">
          {Array.from({ length: columns }, (_, i) => (
            <Bone key={i} className={clsx("h-4", i === 0 ? "w-1/3" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}
