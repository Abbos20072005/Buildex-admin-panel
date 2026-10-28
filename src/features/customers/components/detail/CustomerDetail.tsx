import { Alert, Skeleton, Tabs } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrdersQuery, useOrderStatsQuery } from "@/features/orders";
import { getErrorMessage } from "@/shared/api";
import { useCustomerChatsQuery } from "@/features/chats";
import { useCustomerQuery } from "../../hooks/queries";
import { CUSTOMER_API } from "../../model/capabilities";
import { AccountCard } from "./AccountCard";
import { AddressesTab } from "./AddressesTab";
import { ConsentsCard } from "./ConsentsCard";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerKpis } from "./CustomerKpis";
import { LogTab } from "./LogTab";
import { NotesCard } from "./NotesCard";
import { OrdersTab } from "./OrdersTab";
import { ProfileCard } from "./ProfileCard";
import { RecentOrdersCard } from "./RecentOrdersCard";
import { RequestsTab } from "./RequestsTab";
import { ReturnsTab } from "./ReturnsTab";
import { SegmentCard } from "./SegmentCard";

type TabKey = "overview" | "orders" | "addresses" | "returns" | "requests" | "log";

/** The page of one customer: header, five counters and the tabs of the design. */
export function CustomerDetail({ id }: { id: number }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>("overview");
  const detail = useCustomerQuery(id);
  const recent = useOrdersQuery({ filters: { customer: id }, page: 1, pageSize: 4 });
  const orderStats = useOrderStatsQuery({ customer: id });
  const chats = useCustomerChatsQuery(id);

  if (detail.error) {
    return <Alert type="error" showIcon title={getErrorMessage(detail.error)} />;
  }
  const customer = detail.data;
  if (!customer) return <Skeleton active paragraph={{ rows: 10 }} />;

  /** "Orders 12": the count sits next to the name of the tab */
  const label = (key: TabKey, count?: number) => (
    <span>
      {t(`customers.detailTabs.${key}`)}
      {count !== undefined && <span className="ml-1.5 font-normal text-slate-400">{count}</span>}
    </span>
  );

  return (
    <>
      <CustomerHeader customer={customer} />
      <CustomerKpis
        customer={customer}
        lastOrderAt={customer.lastOrderAt ?? recent.data?.items[0]?.createdAt}
      />
      <Tabs
        activeKey={tab}
        onChange={(key) => setTab(key as TabKey)}
        items={[
          {
            key: "overview",
            label: label("overview"),
            children: (
              <div className="grid items-start gap-5 lg:grid-cols-2">
                <div className="flex flex-col gap-5">
                  <ProfileCard key={`${customer.id}-${customer.fullName}`} customer={customer} />
                  <AccountCard customer={customer} />
                  <ConsentsCard customer={customer} />
                </div>
                <div className="flex flex-col gap-5">
                  <SegmentCard customer={customer} />
                  <NotesCard customerId={customer.id} />
                  <RecentOrdersCard
                    orders={recent.data?.items}
                    onShowAll={() => setTab("orders")}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "orders",
            label: label("orders", orderStats.data?.total),
            children: <OrdersTab customerId={customer.id} />,
          },
          {
            key: "addresses",
            label: label("addresses", customer.addresses.length),
            children: <AddressesTab customer={customer} />,
          },
          {
            key: "returns",
            label: label(
              "returns",
              CUSTOMER_API.returns ? (customer.returnsCount ?? 0) : undefined,
            ),
            children: <ReturnsTab customerId={customer.id} />,
          },
          {
            key: "requests",
            label: label("requests", chats.data?.total),
            children: <RequestsTab customerId={customer.id} />,
          },
          { key: "log", label: label("log"), children: <LogTab customerId={customer.id} /> },
        ]}
      />
    </>
  );
}
