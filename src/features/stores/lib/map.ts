/** Tashkent: the map opens here when the store has no point yet. */
export const TASHKENT: [number, number] = [41.2995, 69.2401];

/** A link that opens the point on Yandex Maps (the order card's "Xaritada ko'rish"). */
export const yandexMapLink = (latitude: number, longitude: number) =>
  `https://yandex.com/maps/?pt=${longitude},${latitude}&z=16&l=map`;

/** "41.311081" ↔ 41.311081; an empty or broken value is no coordinate. */
export function toCoordinate(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
