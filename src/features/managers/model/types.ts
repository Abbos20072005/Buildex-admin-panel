/** Menejer: the person an order is assigned to (the "Menejer" dropdown of an order). */
export interface Manager {
  id: number;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

/** What the editor sends (POST / PATCH /admin/managers/). */
export interface ManagerInput {
  fullName: string;
  isActive: boolean;
}

export interface ManagerFilters {
  search?: string;
  isActive?: boolean;
}

export interface ManagerListParams {
  filters: ManagerFilters;
  page: number;
  pageSize: number;
}
