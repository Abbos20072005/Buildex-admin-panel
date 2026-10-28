import { api, type Page, type Paginated } from "@/shared/api";
import type {
  Project,
  ProjectCategoryExpense,
  ProjectDetail,
  ProjectExpenses,
  ProjectListParams,
  ProjectStatus,
} from "../model/types";

/* ---------- raw shapes of /admin/pro-projects/ ---------- */

interface ProjectDto {
  id: number;
  name: string;
  address?: string | null;
  comment?: string | null;
  status: ProjectStatus;
  archived_at: string | null;
  items_count: number;
  orders_count: number;
  created_at: string;
}
interface ExpensesDto {
  goods: string;
  delivery: string;
  total: string;
  orders_count: number;
  items_count: number;
}
interface CategoryExpenseDto {
  id: number | null;
  name: string | null;
  goods: string;
}
interface ProjectDetailDto extends ProjectDto {
  expenses: ExpensesDto;
  categories: CategoryExpenseDto[];
}

/** Money comes as decimal strings ("1250000.00"). */
const money = (value: string | number | null | undefined) => Number(value ?? 0);

const project = (dto: ProjectDto): Project => ({
  id: dto.id,
  name: dto.name,
  address: dto.address ?? "",
  comment: dto.comment ?? "",
  status: dto.status,
  archivedAt: dto.archived_at,
  itemsCount: dto.items_count,
  ordersCount: dto.orders_count,
  createdAt: dto.created_at,
});

const expenses = (dto: ExpensesDto): ProjectExpenses => ({
  goods: money(dto.goods),
  delivery: money(dto.delivery),
  total: money(dto.total),
  ordersCount: dto.orders_count,
  itemsCount: dto.items_count,
});

const category = (dto: CategoryExpenseDto): ProjectCategoryExpense => ({
  id: dto.id,
  name: dto.name ?? "",
  goods: money(dto.goods),
});

export const proProjectsApi = {
  /** GET /admin/pro-projects/?customer= — read only; the totals are in the detail */
  async list({ customer, status, page, pageSize }: ProjectListParams): Promise<Page<Project>> {
    const data = await api.get<Paginated<ProjectDto>>("/pro-projects/", {
      customer,
      status,
      page,
      page_size: pageSize,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(project) };
  },

  /** GET /admin/pro-projects/{id}/ — with the expenses and their split by category */
  async get(id: number): Promise<ProjectDetail> {
    const dto = await api.get<ProjectDetailDto>(`/pro-projects/${id}/`);
    return {
      ...project(dto),
      expenses: expenses(dto.expenses),
      categories: dto.categories.map(category),
    };
  },
};
