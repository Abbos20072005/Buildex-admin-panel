import { api } from "@/shared/api";

export type StagePeriod = "quarter" | "half_year" | "year";
export type StageDelivery = "all" | "courier" | "pickup";
export type StageKey = "confirm" | "toPreparing" | "delivery";

/** One metric of one month; the times are `null` when no order finished the stage in that month. */
export interface StageValue {
  avgSeconds: number | null;
  medianSeconds: number | null;
  count: number;
}

export interface StageMonth {
  /** YYYY-MM: the month the stage ended in */
  month: string;
  confirm: StageValue;
  toPreparing: StageValue;
  delivery: StageValue;
}

/* ---------- raw shape of GET /admin/dashboard/order-stages/ ---------- */

interface StageDto {
  avg_seconds: number | null;
  median_seconds: number | null;
  count: number;
}
interface OrderStagesDto {
  months: {
    month: string;
    confirm: StageDto;
    to_preparing: StageDto;
    delivery: StageDto;
  }[];
}

const stage = (dto: StageDto): StageValue => ({
  avgSeconds: dto.avg_seconds,
  medianSeconds: dto.median_seconds,
  count: dto.count,
});

export const orderStagesApi = {
  /** GET /admin/dashboard/order-stages/ — time orders spend in each stage, per month */
  async get(period: StagePeriod, deliveryMethod: StageDelivery): Promise<StageMonth[]> {
    const dto = await api.get<OrderStagesDto>("/dashboard/order-stages/", {
      period,
      delivery_method: deliveryMethod,
    });
    return dto.months.map((item) => ({
      month: item.month,
      confirm: stage(item.confirm),
      toPreparing: stage(item.to_preparing),
      delivery: stage(item.delivery),
    }));
  },
};
