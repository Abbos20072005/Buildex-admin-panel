import { Card, Skeleton } from "antd";
import type { Dashboard, Period } from "../model/types";
import { AttentionCard } from "./AttentionCard";
import { CatalogCard } from "./CatalogCard";
import { CustomersCard } from "./CustomersCard";
import { DeliveredOrdersCard } from "./DeliveredOrdersCard";
import { KpiCards } from "./KpiCards";
import { RecentOrdersCard } from "./RecentOrdersCard";
import { RegistrationsCard } from "./RegistrationsCard";
import { RevenueCard } from "./RevenueCard";

interface Props {
  data: Dashboard;
  period: Period;
  onPeriodChange: (period: Period) => void;
}

/** All widgets of the dashboard in their grid. */
export function DashboardView({ data, period, onPeriodChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <KpiCards summary={data.summary} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <DeliveredOrdersCard
          data={data.delivered}
          period={period}
          onPeriodChange={onPeriodChange}
        />
        <RegistrationsCard data={data.registrations} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RecentOrdersCard orders={data.recentOrders} />
        <AttentionCard data={data.attention} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CustomersCard data={data.customers} />
        <CatalogCard data={data.catalog} moderationQueue={data.attention.moderationQueue} />
      </div>

      <RevenueCard data={data.revenue} />
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
