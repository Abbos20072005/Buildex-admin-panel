import { api } from "@/shared/api";
import type { Dashboard, DashboardParams } from "../model/types";
import type { DashboardDto } from "./dashboard.dto";
import { mapDashboard, paramsToQuery } from "./dashboard.mappers";

export const dashboardApi = {
  /** GET /admin/dashboard/ — every widget in one response (not cached on the backend) */
  async get(params: DashboardParams): Promise<Dashboard> {
    return mapDashboard(await api.get<DashboardDto>("/dashboard/", paramsToQuery(params)));
  },
};
