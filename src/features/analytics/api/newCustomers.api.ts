import { api } from "@/shared/api";

export type NewCustomersPeriod = "6_months" | "12_months" | "all_time";

export interface NewCustomersMonth {
  /** first day of the month, YYYY-MM-DD */
  month: string;
  total: number;
  /** registered in the mobile app */
  app: number;
  /** registered on the site */
  site: number;
}

export interface NewCustomers {
  /** the whole period */
  total: number;
  app: number;
  site: number;
  /** oldest first; a month without sign-ups is a real 0 */
  months: NewCustomersMonth[];
}

/* ---------- raw shape of GET /admin/dashboard/new-customers/ ---------- */

interface NewCustomersDto {
  total: number;
  app: number;
  site: number;
  months: NewCustomersMonth[];
}

export const newCustomersApi = {
  /** GET /admin/dashboard/new-customers/ — verified sign-ups per month, split app / site */
  async get(period: NewCustomersPeriod): Promise<NewCustomers> {
    const dto = await api.get<NewCustomersDto>("/dashboard/new-customers/", { period });
    return { total: dto.total, app: dto.app, site: dto.site, months: dto.months };
  },
};
