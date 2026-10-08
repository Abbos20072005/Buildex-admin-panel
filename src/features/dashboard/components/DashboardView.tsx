import { Card, Skeleton } from "antd";
import type { Dashboard, Period } from "../model/types";
import { AttentionCard } from "./AttentionCard";
import { CatalogCard } from "./CatalogCard";
import { CustomersCard } from "./CustomersCard";
import { DeliveredOrdersCard } from "./DeliveredOrdersCard";
import { KpiCards } from "./KpiCards";
import { ManagersCard } from "./ManagersCard";
import { RecentOrdersCard } from "./RecentOrdersCard";
import { RegistrationsCard } from "./RegistrationsCard";
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
  /** registrations chart */
  registrations: Span<Dashboard["registrations"]>;
  months: number;
  onMonthsChange: (months: number) => void;
}

/** All widgets of the dashboard in their grid. */
export function DashboardView({ data, delivered, registrations, months, onMonthsChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <KpiCards summary={data.summary} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <DeliveredOrdersCard
          data={delivered.data}
          period={delivered.period}
          onPeriodChange={delivered.onPeriodChange}
        />
        <RegistrationsCard
          data={registrations.data}
          period={registrations.period}
          onPeriodChange={registrations.onPeriodChange}
        />
      </div>

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

/** Grey placeholders while the first response is on its way. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Card key={key}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    </div>
  );
}
