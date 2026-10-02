import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardParams } from "../model/types";

export function useDashboardQuery(params: DashboardParams) {
  // names (categories) come back in the UI language, so it is part of the cache key
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: ["dashboard", lang, params],
    queryFn: () => dashboardApi.get(params),
    // keep the old numbers on screen while a new period loads
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
