import { Card, Skeleton } from "antd";
import type { Today } from "../model/types";
import { AttentionList } from "./AttentionList";
import { CatalogStatusCard } from "./CatalogStatusCard";
import { ContentCard } from "./ContentCard";
import { OrdersChart } from "./OrdersChart";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { SummaryCards } from "./SummaryCards";

/** All widgets of "Bugungi ishlar" in their grid. */
export function TodayView({ data }: { data: Today }) {
  return (
    <div className="flex flex-col gap-4">
      <SummaryCards cards={data.cards} />
      <AttentionList data={data.attention} now={data.now} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CatalogStatusCard data={data.catalog} />
        <ContentCard data={data.attention} />
      </div>
      <OrdersChart data={data.ordersChart} now={data.now} />
      <RecentOrdersTable orders={data.recentOrders} />
    </div>
  );
}

/** Grey placeholders while the first response is on its way. */
export function TodaySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Card key={key}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </div>
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    </div>
  );
}
