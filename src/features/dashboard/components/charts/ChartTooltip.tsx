import dayjs from "dayjs";

/** Body of a chart hover tooltip: a title and "name … value" rows. */
export function ChartTooltip({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <>
      <div className="mb-1 text-slate-300">{title}</div>
      {rows.map(([name, value]) => (
        <div key={name} className="flex items-center gap-1.5">
          <span className="text-slate-300">{name}</span>
          <b className="ml-6 flex-1 text-right tabular-nums">{value}</b>
        </div>
      ))}
    </>
  );
}

/** Title of a chart point: "2 noyabr" for a day, "Noyabr 2026" for a month. */
export const pointTitle = (date: string, step: "day" | "month") =>
  dayjs(date).format(step === "month" ? "MMMM YYYY" : "D MMMM");
