import { StarIcon } from "@/shared/icons";
import { clsx } from "@/shared/lib/clsx";

interface Props {
  /** 1–5 */
  value: number;
  className?: string;
}

/** Five stars, the rated ones are yellow. */
export function Stars({ value, className }: Props) {
  return (
    <span
      role="img"
      aria-label={`${value} / 5`}
      className={clsx("inline-flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          // the icon is as big as its font: 1em
          className={clsx("text-base", star <= Math.round(value) ? "text-amber-400" : "text-slate-200")}
        />
      ))}
    </span>
  );
}
