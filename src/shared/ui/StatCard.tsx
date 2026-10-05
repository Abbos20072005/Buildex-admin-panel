interface Props {
  label: string;
  value: number | string | undefined;
  note: string;
  /** Tailwind text colour of the number */
  tone?: string;
}

/** A counter card: small label, big number, a note under it. */
export function StatCard({ label, value, note, tone = "text-slate-900" }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className={`mt-2 text-3xl leading-none font-extrabold tabular-nums ${tone}`}>
        {value ?? "—"}
      </div>
      <div className="mt-2 text-xs text-slate-500">{note}</div>
    </div>
  );
}
