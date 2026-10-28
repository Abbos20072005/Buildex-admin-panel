import { Alert, Skeleton, Table, Tag, type TableColumnsType } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { useCustomerProjectsQuery, useProjectDetailQuery } from "../hooks/queries";
import { PROJECT_STATUSES, type Project, type ProjectStatus } from "../model/types";

const PAGE_SIZE = 20;

function StatusTag({ project }: { project: Project }) {
  const { t } = useTranslation();
  return (
    <Tag
      color={project.status === "active" ? "green" : "default"}
      variant="filled"
      className="m-0 font-semibold"
    >
      {t(`projects.status.${project.status}`)}
    </Tag>
  );
}

/** The total spent: the list has no totals, they come with the detail (cached, shared with the row). */
function Total({ id }: { id: number }) {
  const { data, isPending } = useProjectDetailQuery(id);
  if (isPending) return <Skeleton.Input active size="small" style={{ width: 90, minWidth: 90 }} />;
  if (!data) return <span className="text-slate-400">—</span>;
  return <span className="font-semibold tabular-nums">{formatNumber(data.expenses.total)}</span>;
}

/** What is inside an opened project: the comment, goods / delivery / total and the split by category. */
function Details({ project }: { project: Project }) {
  const { t } = useTranslation();
  const { data, error, isPending } = useProjectDetailQuery(project.id);
  if (error) return <Alert type="error" showIcon title={getErrorMessage(error)} />;
  if (isPending || !data) return <Skeleton active paragraph={{ rows: 2 }} title={false} />;

  const rows: [string, number][] = [
    [t("projects.expenses.goods"), data.expenses.goods],
    [t("projects.expenses.delivery"), data.expenses.delivery],
    [t("projects.expenses.total"), data.expenses.total],
  ];
  return (
    <div className="grid gap-6 py-1 md:grid-cols-2">
      <div>
        {project.comment && (
          <div className="mb-3 text-sm whitespace-pre-wrap text-slate-600">{project.comment}</div>
        )}
        <dl className="m-0 grid max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 text-sm">
          {rows.map(([label, value], index) => (
            <div key={label} className="contents">
              <dt className="text-slate-500">{label}</dt>
              <dd
                className={clsx(
                  "m-0 text-right tabular-nums",
                  index === rows.length - 1 && "font-bold",
                )}
              >
                {formatNumber(value)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 mb-0 text-xs text-slate-500">{t("projects.expenses.hint")}</p>
      </div>
      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-600">
          {t("projects.expenses.categories")}
        </div>
        {data.categories.length === 0 ? (
          <div className="text-sm text-slate-400">—</div>
        ) : (
          <ul className="m-0 list-none divide-y divide-slate-100 p-0 text-sm">
            {data.categories.map((category, index) => (
              <li
                key={category.id ?? `none-${index}`}
                className="flex justify-between gap-4 py-1.5"
              >
                <span>{category.name || t("projects.noCategory")}</span>
                <span className="tabular-nums">{formatNumber(category.goods)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * "Loyihalari" of a PRO customer: the projects he made in the app, with their status and what was
 * spent. Read only — the manager never edits a project.
 */
export function CustomerProjects({ customerId }: { customerId: number }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ProjectStatus>();
  const [page, setPage] = useState(1);
  const projects = useCustomerProjectsQuery({
    customer: customerId,
    status,
    page,
    pageSize: PAGE_SIZE,
  });

  const columns: TableColumnsType<Project> = [
    {
      key: "name",
      title: t("projects.columns.name"),
      render: (_, project) => (
        <div className="min-w-0">
          <div className="font-semibold">{project.name}</div>
          {project.address && <div className="text-xs text-slate-500">{project.address}</div>}
        </div>
      ),
    },
    {
      key: "status",
      title: t("projects.columns.status"),
      width: 130,
      render: (_, project) => (
        <div>
          <StatusTag project={project} />
          {project.archivedAt && (
            <div className="mt-0.5 text-xs text-slate-400">{formatDate(project.archivedAt)}</div>
          )}
        </div>
      ),
    },
    {
      key: "orders",
      title: t("projects.columns.orders"),
      width: 110,
      align: "right",
      render: (_, project) => formatNumber(project.ordersCount),
    },
    {
      key: "items",
      title: t("projects.columns.items"),
      width: 110,
      align: "right",
      render: (_, project) => formatNumber(project.itemsCount),
    },
    {
      key: "total",
      title: t("projects.columns.total"),
      width: 160,
      align: "right",
      render: (_, project) => <Total id={project.id} />,
    },
    {
      key: "created",
      title: t("projects.columns.created"),
      width: 130,
      render: (_, project) => formatDate(project.createdAt),
    },
  ];

  return (
    <div>
      <p className="mt-0 mb-3 text-xs text-slate-500">{t("projects.hint")}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {([undefined, ...PROJECT_STATUSES] as (ProjectStatus | undefined)[]).map((key) => (
          <button
            key={key ?? "all"}
            type="button"
            onClick={() => {
              setStatus(key);
              setPage(1);
            }}
            className={clsx(
              "cursor-pointer rounded-full border-0 px-3.5 py-1.5 text-sm font-semibold",
              key === status
                ? "bg-brand-soft text-brand"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            {t(`projects.filter.${key ?? "all"}`)}
          </button>
        ))}
      </div>

      {projects.error && !projects.data ? (
        <Alert type="error" showIcon title={getErrorMessage(projects.error)} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table<Project>
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={projects.data?.items ?? []}
            loading={projects.isFetching}
            scroll={{ x: 760 }}
            expandable={{
              expandedRowRender: (project) => <Details project={project} />,
              rowExpandable: () => true,
            }}
            locale={{
              emptyText: <div className="py-10 text-slate-400">{t("projects.empty")}</div>,
            }}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: projects.data?.total ?? 0,
              showSizeChanger: false,
              hideOnSinglePage: true,
              onChange: setPage,
            }}
          />
        </div>
      )}
    </div>
  );
}
