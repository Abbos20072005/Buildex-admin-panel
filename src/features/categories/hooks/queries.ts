import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Page } from "@/shared/api";
import { categoriesApi, MAX_PAGE_SIZE } from "../api/categories.api";
import { parentOptions } from "../api/categories.mappers";
import { categoryKeys } from "../api/query-keys";
import type {
  CategoryAttributeRef,
  CategoryFiles,
  CategoryFormValues,
  CategoryItem,
  CategoryLevel,
  CategoryRow,
} from "../model/types";

const LEVELS: CategoryLevel[] = [1, 2, 3];

/**
 * The category lists are slow on the backend (counters are computed per row), so a loaded
 * list is reused for a minute and a failed one is retried once, not three times.
 */
const LIST_OPTIONS = { staleTime: 60_000, retry: 1 } as const;

/** "2:6" — level and id (ids repeat between levels) */
export const nodeKey = (item: Pick<CategoryItem, "level" | "id">) => `${item.level}:${item.id}`;

/** Every page of a level (the API gives at most 100 per page). */
async function listAll(level: CategoryLevel): Promise<CategoryItem[]> {
  const items: CategoryItem[] = [];
  for (let page = 1; page <= 50; page++) {
    const data = await categoriesApi.list({ level, page, pageSize: MAX_PAGE_SIZE });
    items.push(...data.items);
    if (items.length >= data.total || data.items.length === 0) break;
  }
  return items;
}

/**
 * Rows of the table. The top level is loaded at once, the children of a category only when it
 * is opened (`expanded`). While searching, the three levels are searched separately and the
 * matches are shown as a flat list.
 */
export function useCategoryRows(expanded: ReadonlySet<string>, search: string) {
  const term = search.trim();

  const roots = useQuery({
    queryKey: categoryKeys.list(1, null),
    queryFn: () => categoriesApi.list({ level: 1 }),
    enabled: !term,
    ...LIST_OPTIONS,
  });

  const openKeys = term ? [] : [...expanded];
  const children = useQueries({
    queries: openKeys.map((key) => {
      const [level, id] = key.split(":").map(Number);
      const childLevel = (level + 1) as CategoryLevel;
      return {
        queryKey: categoryKeys.list(childLevel, id),
        queryFn: () => categoriesApi.list({ level: childLevel, parentId: id }),
        ...LIST_OPTIONS,
      };
    }),
  });

  const found = useQueries({
    queries: LEVELS.map((level) => ({
      queryKey: [...categoryKeys.search(term), level],
      queryFn: () => categoriesApi.list({ level, search: term, pageSize: 50 }),
      enabled: !!term,
      ...LIST_OPTIONS,
    })),
  });

  const rows: CategoryRow[] = [];
  if (term) {
    for (const query of found) {
      for (const item of query.data?.items ?? []) {
        rows.push({ item, depth: 0, loadingChildren: false, canReorder: false, siblingIds: [] });
      }
    }
  } else {
    const byKey = new Map(openKeys.map((key, index) => [key, children[index]]));
    const walk = (page: Page<CategoryItem> | undefined, depth: number) => {
      if (!page) return;
      const siblingIds = page.items.map((item) => item.id);
      for (const item of page.items) {
        const open = byKey.get(nodeKey(item));
        rows.push({
          item,
          depth,
          loadingChildren: !!open?.isPending,
          // a page holds 100 at most — a partial list can't be reordered
          canReorder: page.items.length > 1 && page.total <= MAX_PAGE_SIZE,
          siblingIds,
        });
        walk(open?.data, depth + 1);
      }
    };
    walk(roots.data, 0);
  }

  const queries = term ? found : [roots];
  return {
    rows,
    loading: queries.some((query) => query.isPending && query.fetchStatus !== "idle"),
    error: queries.find((query) => query.error)?.error ?? children.find((q) => q.error)?.error,
  };
}

/** Categories and sub categories — the parents to choose from in the form. */
export function useParentOptionsQuery(enabled: boolean) {
  return useQuery({
    queryKey: categoryKeys.parents(),
    queryFn: async () => parentOptions(await listAll(1), await listAll(2)),
    enabled,
    ...LIST_OPTIONS,
  });
}

export function useCategoryAttributesQuery(id: number | null) {
  return useQuery({
    queryKey: categoryKeys.attributes(id ?? 0),
    queryFn: () => categoriesApi.attributes(id as number),
    enabled: id !== null,
  });
}

/** Attributes of a category are read on the product page, the lists have the filters counters. */
function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["attributes"] });
    void queryClient.invalidateQueries({ queryKey: ["attributes-admin"] });
  };
}

export interface SaveCategoryInput {
  level: CategoryLevel;
  /** null — create */
  id: number | null;
  values: CategoryFormValues;
  files: CategoryFiles;
  parentId: number | null;
  /** attributes before editing; the list is sent only when it changed */
  initialAttributes: CategoryAttributeRef[];
}

/**
 * Saves the category and, for item categories, its attribute set (a separate endpoint).
 * If the second step fails the category itself is already saved.
 */
export function useSaveCategory() {
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: async (input: SaveCategoryInput) => {
      const saved = await categoriesApi.save(
        input.level,
        input.id,
        input.values,
        input.files,
        input.parentId,
      );
      if (input.level === 3) {
        // the set, its order and the quick filter settings
        const signature = (items: CategoryAttributeRef[]) =>
          items.map((item) => [item.id, item.isQuickFilter, item.maxQuickFilters].join(":")).join();
        if (signature(input.values.attributes) !== signature(input.initialAttributes))
          await categoriesApi.setAttributes(saved.id, input.values.attributes);
      }
      return saved;
    },
    onSettled: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ level, id }: { level: CategoryLevel; id: number }) =>
      categoriesApi.remove(level, id),
    onSuccess: invalidate,
  });
}

export interface ReorderInput {
  level: CategoryLevel;
  parentId: number | null;
  /** all brothers and sisters in the new order */
  ids: number[];
}

/** The list is reordered at once, then confirmed (or rolled back) by the server. */
export function useReorderCategories() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateCategories();

  return useMutation({
    mutationFn: ({ level, ids }: ReorderInput) => categoriesApi.reorder(level, ids),
    onMutate: ({ level, parentId, ids }) => {
      const key = categoryKeys.list(level, parentId);
      const previous = queryClient.getQueryData<Page<CategoryItem>>(key);
      if (previous) {
        const order = new Map(ids.map((id, index) => [id, index]));
        queryClient.setQueryData<Page<CategoryItem>>(key, {
          ...previous,
          items: [...previous.items].sort(
            (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
          ),
        });
      }
      return { key, previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
    },
    onSettled: invalidate,
  });
}
