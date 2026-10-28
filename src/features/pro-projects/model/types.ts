export type ProjectStatus = "active" | "archived";

export const PROJECT_STATUSES: ProjectStatus[] = ["active", "archived"];

/** A PRO customer's project (GET /admin/pro-projects/) — the admin only reads them. */
export interface Project {
  id: number;
  name: string;
  address: string;
  comment: string;
  status: ProjectStatus;
  archivedAt: string | null;
  /** order items linked to the project */
  itemsCount: number;
  /** orders that have such items */
  ordersCount: number;
  createdAt: string;
}

export interface ProjectCategoryExpense {
  id: number | null;
  name: string;
  goods: number;
}

/** What was spent: paid orders, not canceled, all time — as the customer sees it. */
export interface ProjectExpenses {
  goods: number;
  delivery: number;
  total: number;
  ordersCount: number;
  itemsCount: number;
}

/** GET /admin/pro-projects/{id}/ — the project with its expenses. */
export interface ProjectDetail extends Project {
  expenses: ProjectExpenses;
  categories: ProjectCategoryExpense[];
}

export interface ProjectListParams {
  customer: number;
  status?: ProjectStatus;
  page: number;
  pageSize: number;
}
