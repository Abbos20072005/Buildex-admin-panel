import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { productFunnelApi, type FunnelFilters } from "../api/productFunnel.api";
import { newCustomersApi, type NewCustomersPeriod } from "../api/newCustomers.api";
import { orderStagesApi, type StageDelivery, type StagePeriod } from "../api/orderStages.api";
import { salesAnalyticsApi } from "../api/sales.api";
import { statusesApi, type OrderStatusPeriod } from "../api/statuses.api";
import { topSalesApi, type TopPeriod } from "../api/topSales.api";
import type { SalesFilters } from "../model/types";

export function useProductFunnelQuery(filters: FunnelFilters, page: number, pageSize: number) {
  return useQuery({
    queryKey: ["analytics", "product-funnel", filters, page, pageSize],
    queryFn: () => productFunnelApi.list(filters, page, pageSize),
    // keep the rows on screen while the next page or filter loads
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useNewCustomersQuery(period: NewCustomersPeriod, enabled = true) {
  return useQuery({
    queryKey: ["analytics", "new-customers", period],
    queryFn: () => newCustomersApi.get(period),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useTopSalesQuery(period: TopPeriod) {
  return useQuery({
    queryKey: ["analytics", "top-sales", period],
    queryFn: () => topSalesApi.sales(period),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useTopCustomersQuery(period: TopPeriod) {
  return useQuery({
    queryKey: ["analytics", "top-customers", period],
    queryFn: () => topSalesApi.customers(period),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useOrderStatusesQuery(period: OrderStatusPeriod) {
  return useQuery({
    queryKey: ["analytics", "order-statuses", period],
    queryFn: () => statusesApi.orders(period),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useProductStatusesQuery() {
  return useQuery({
    queryKey: ["analytics", "product-statuses"],
    queryFn: () => statusesApi.products(),
    staleTime: 60_000,
  });
}

export function useOrderStagesQuery(period: StagePeriod, deliveryMethod: StageDelivery = "all") {
  return useQuery({
    queryKey: ["analytics", "order-stages", period, deliveryMethod],
    queryFn: () => orderStagesApi.get(period, deliveryMethod),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useSalesAnalyticsQuery(filters: SalesFilters) {
  // category names come back in the UI language
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: ["analytics", "sales", lang, filters],
    queryFn: () => salesAnalyticsApi.get(filters),
    // keep the numbers on screen while another period loads
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
