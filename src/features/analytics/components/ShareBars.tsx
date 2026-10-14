import { Card } from "antd";
import type { ReactNode } from "react";
import { clsx } from "@/shared/lib/clsx";
import { percent } from "@/features/dashboard";

export interface ShareRow {
  key: string | number;
  label: string;
  /** 0–100 */
  percent: number;
  /** text after the percent: "1179 mln", "1 719 ta" */
  value: string;
}

interface Props {
  title: string;
  /** small grey text at the right of the title */
  subtitle?: string;
  rows: ShareRow[];
  /** Tailwind `bg-*` class of the bars */
  barClass: string;
  empty: string;
  footer?: ReactNode;
}

/** A list of horizontal bars: "Sayt · 52% · 1179 mln". */
export function ShareBars({ title, subtitle, rows, barClass, empty, footer }: Props) {
  return (
    <Card
      title={<span className="text-base font-bold">{title}</span>}
      extra={subtitle ? <span className="text-xs text-slate-500">{subtitle}</span> : undefined}
    >
      {rows.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">{empty}</div>
      ) : (
        <ul className="m-0 list-none space-y-3 p-0">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{row.label}</span>
                <span className="shrink-0 tabular-nums">
                  <b>{percent(row.percent)}</b>
                  <span className="text-slate-500"> · {row.value}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={clsx("h-full rounded-full", barClass)}
                  style={{ width: `${Math.min(100, Math.max(1, row.percent))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {footer}
    </Card>
  );
}
