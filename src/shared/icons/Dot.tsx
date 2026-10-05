/** A solid dot inside an outline icon (a zero-length line vanishes at small sizes). */
export const Dot = ({ x, y, r = 1.05 }: { x: number; y: number; r?: number }) => (
  <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />
);
