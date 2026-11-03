import { api } from "@/shared/api";

export type TopPeriod = "current_month" | "last_3_months" | "year" | "all_time";

/** A category or a brand in the top; `id` is null for products without one. */
export interface TopRow {
  id: number | null;
  name: string | null;
  /** sold amount, UZS */
  amount: number;
  ordersCount: number;
  percent: number;
}

/** Everything after the top 10, as one row (`count` 0 — there is none). */
export interface TopOthers {
  count: number;
  amount: number;
  ordersCount: number;
  percent: number;
}

export interface TopGroup {
  items: TopRow[];
  others: TopOthers;
}

export interface TopSales {
  /** sold amount of the whole period = "Umumiy daromad" */
  total: number;
  ordersCount: number;
  categories: TopGroup;
  brands: TopGroup;
}

export interface TopCustomer {
  id: number;
  fullName: string;
  /** masked by the API; the full number is on the customer card */
  phoneNumber: string;
  isPro: boolean;
  /** the customer deleted the account (the orders stay) */
  isDeleted: boolean;
  ordersCount: number;
  amount: number;
  percent: number;
  /** ISO time of the last counted order in the period */
  lastOrderAt: string | null;
}

export interface TopCustomers {
  total: number;
  ordersCount: number;
  customers: TopCustomer[];
}

/* ---------- raw shapes of GET /admin/dashboard/top-sales/ and top-customers/ ---------- */

interface RowDto {
  id: number | null;
  name: string | null;
  amount: number;
  orders_count: number;
  percent: number;
}
interface GroupDto {
  items: RowDto[];
  others: { count: number; amount: number; orders_count: number; percent: number };
}
interface TopSalesDto {
  total: number;
  orders_count: number;
  categories: GroupDto;
  brands: GroupDto;
}
interface TopCustomersDto {
  total: number;
  orders_count: number;
  customers: {
    id: number;
    full_name: string | null;
    phone_number: string | null;
    role: string;
    is_pro: boolean;
    is_deleted: boolean;
    orders_count: number;
    amount: number;
    percent: number;
    last_order_at: string | null;
  }[];
}

const row = (dto: RowDto): TopRow => ({
  id: dto.id,
  name: dto.name,
  amount: dto.amount,
  ordersCount: dto.orders_count,
  percent: dto.percent,
});
const group = (dto: GroupDto): TopGroup => ({
  items: dto.items.map(row),
  others: {
    count: dto.others.count,
    amount: dto.others.amount,
    ordersCount: dto.others.orders_count,
    percent: dto.others.percent,
  },
});

export const topSalesApi = {
  /** GET /admin/dashboard/top-sales/ — top 10 categories and brands by sold amount */
  async sales(period: TopPeriod): Promise<TopSales> {
    const dto = await api.get<TopSalesDto>("/dashboard/top-sales/", { period });
    return {
      total: dto.total,
      ordersCount: dto.orders_count,
      categories: group(dto.categories),
      brands: group(dto.brands),
    };
  },

  /** GET /admin/dashboard/top-customers/ — top 10 customers by sold amount */
  async customers(period: TopPeriod): Promise<TopCustomers> {
    const dto = await api.get<TopCustomersDto>("/dashboard/top-customers/", { period });
    return {
      total: dto.total,
      ordersCount: dto.orders_count,
      customers: dto.customers.map((item) => ({
        id: item.id,
        fullName: item.full_name ?? "",
        phoneNumber: item.phone_number ?? "",
        isPro: item.is_pro || item.role === "prorab",
        isDeleted: item.is_deleted,
        ordersCount: item.orders_count,
        amount: item.amount,
        percent: item.percent,
        lastOrderAt: item.last_order_at,
      })),
    };
  },
};
