import { Card } from "antd";
import type { ReactNode } from "react";
import { Bone, ChartSkeleton, DonutSkeleton } from "@/shared/ui";
import type { Dashboard, Period } from "../model/types";
import { AttentionCard } from "./AttentionCard";
import { CatalogCard } from "./CatalogCard";
import { CustomersCard } from "./CustomersCard";
import { DeliveredOrdersCard } from "./DeliveredOrdersCard";
import { KpiCards, KpiTotals } from "./KpiCards";
import { ManagersCard } from "./ManagersCard";
import { RecentOrdersCard } from "./RecentOrdersCard";
import { RevenueCard } from "./RevenueCard";

/** A chart card with its own time span: the data of that span and how to change it. */
interface Span<T> {
  data: T;
  period: Period;
  onPeriodChange: (period: Period) => void;
}

interface Props {
  data: Dashboard;
  /** delivered orders chart */
  delivered: Span<Dashboard["delivered"]>;
  months: number;
  onMonthsChange: (months: number) => void;
  /** the received-orders chart (it lives in the analytics feature, which imports this one) */
  receivedOrders?: ReactNode;
  /** the order-stage time charts (analytics feature too) */
  stageTimes?: ReactNode;
  /** the order-status and product-status pies (analytics feature too) */
  statusPies?: ReactNode;
  /** top categories, brands and customers (analytics feature too) */
  topSales?: ReactNode;
  /** registered customers: days, months, split app / site (analytics feature too) */
  registrationsChart?: ReactNode;
}

/** All widgets of the dashboard in their grid. */
export function DashboardView({
  data,
  delivered,
  months,
  onMonthsChange,
  receivedOrders,
  stageTimes,
  statusPies,
  topSales,
  registrationsChart,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {data.allTime && <KpiTotals allTime={data.allTime} />}
      <KpiCards summary={data.summary} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DeliveredOrdersCard
          data={delivered.data}
          period={delivered.period}
          onPeriodChange={delivered.onPeriodChange}
        />
        {receivedOrders}
      </div>

      {registrationsChart}

      {stageTimes && <div className="grid gap-4 xl:grid-cols-2">{stageTimes}</div>}

      {statusPies && <div className="grid gap-4 xl:grid-cols-2">{statusPies}</div>}

      {topSales}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RecentOrdersCard orders={data.recentOrders} />
        <AttentionCard data={data.attention} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <CustomersCard data={data.customers} />
        <ManagersCard />
        <CatalogCard data={data.catalog} moderationQueue={data.attention.moderationQueue} />
      </div>

      <RevenueCard data={data.revenue} months={months} onMonthsChange={onMonthsChange} />
    </div>
  );
}

/** A card with a title bar and a chart like the real widgets (the header height matches `WidgetCard`). */
function CardSkeleton({ children }: { children: ReactNode }) {
  return (
    <Card title={<Bone className="h-5 w-48" />} extra={<Bone className="h-6 w-40" />}>
      {children}
    </Card>
  );
}

/** Placeholders in the shape of the dashboard while the first response is on its way. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* all-time numbers */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
        <Bone className="mb-3 h-3 w-40" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="space-y-2">
              <Bone className="h-3 w-24" />
              <Bone className="h-6 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* the four KPI cards: an icon, a label, the number, the change */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2.5">
              <Bone className="size-8 rounded-lg" />
              <Bone className="h-3.5 w-28" />
            </div>
            <Bone className="mt-3 h-8 w-32" />
            <Bone className="mt-2 h-3.5 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CardSkeleton>
          <ChartSkeleton />
        </CardSkeleton>
        <CardSkeleton>
          <ChartSkeleton />
        </CardSkeleton>
      </div>

      <CardSkeleton>
        <ChartSkeleton height={240} />
      </CardSkeleton>

      <div className="grid gap-4 xl:grid-cols-2">
        <CardSkeleton>
          <DonutSkeleton />
        </CardSkeleton>
        <CardSkeleton>
          <DonutSkeleton />
        </CardSkeleton>
      </div>
    </div>
  );
}
