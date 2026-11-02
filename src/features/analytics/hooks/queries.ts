import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  orderStagesApi,
  type StageDelivery,
  type StagePeriod,
} from "../api/orderStages.api";
import { salesAnalyticsApi } from "../api/sales.api";
import type { SalesFilters } from "../model/types";

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
