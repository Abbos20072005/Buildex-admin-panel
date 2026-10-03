import { api } from "@/shared/api";
import type { Today } from "../model/types";
import type { TodayDto } from "./today.dto";
import { mapToday } from "./today.mappers";

export const todayApi = {
  /** GET /admin/today/ — every widget of the page in one response (not cached) */
  async get(): Promise<Today> {
    return mapToday(await api.get<TodayDto>("/today/"));
  },
};
