import type { ReactNode } from "react";

interface CardProps {
  title: string;
  /** right side of the header: a link or a button */
  extra?: ReactNode;
  children: ReactNode;
  /** no padding: the body brings its own rows */
  flush?: boolean;
}

/** A white card with a title line, the building block of the customer page. */
export function SectionCard({ title, extra, children, flush }: CardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <h2 className="m-0 text-base font-bold">{title}</h2>
        {extra}
      </header>
      <div className={flush ? "" : "px-5 py-4"}>{children}</div>
    </section>
  );
}

/** One "label — value" line of a card. */
export function InfoRow({
  label,
  children,
  last,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid min-h-12 grid-cols-[120px_minmax(0,1fr)] items-center gap-3 ${last ? "" : "border-b border-slate-100"}`}
    >
      <div className="text-sm text-slate-500">{label}</div>
      <div className="min-w-0 text-sm">{children}</div>
    </div>
  );
}

/** A muted line for a card that has nothing to show yet. */
export function CardEmpty({ children }: { children: ReactNode }) {
  return <div className="py-2 text-sm text-slate-400">{children}</div>;
}
