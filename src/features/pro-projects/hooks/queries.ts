import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { proProjectsApi } from "../api/pro-projects.api";
import type { ProjectListParams } from "../model/types";

const ALL = ["pro-projects"] as const;

export function useCustomerProjectsQuery(params: ProjectListParams) {
  return useQuery({
    queryKey: [...ALL, "list", params],
    queryFn: () => proProjectsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** The expenses of a project: shared by the "total" cell and the opened row (one request). */
export function useProjectDetailQuery(id: number) {
  return useQuery({
    queryKey: [...ALL, "detail", id],
    queryFn: () => proProjectsApi.get(id),
    staleTime: 60_000,
  });
}
