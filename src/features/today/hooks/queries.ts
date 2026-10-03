import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { todayApi } from "../api/today.api";

/** The page is a live board: it refetches every minute. */
export function useTodayQuery() {
  // names (products, banners) come back in the UI language
  const lang = useTranslation().i18n.language;
  return useQuery({
    queryKey: ["today", lang],
    queryFn: todayApi.get,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
}
