import { Card, Descriptions, Tag, type DescriptionsProps } from "antd";
import { useTranslation } from "react-i18next";
import { formatDateTime, maskPhone } from "@/shared/lib/format";
import type { OrderDetail } from "../../model/types";

function MapPreview({ lat, lng }: { lat: number; lng: number }) {
  const { t } = useTranslation();
  const bbox = [lng - 0.006, lat - 0.003, lng + 0.006, lat + 0.003].join(",");

  return (
    <div className="relative mb-3 h-44 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <iframe
        title="map"
        loading="lazy"
        className="size-full border-0"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
      />
      <a
        href={`https://yandex.uz/maps/?pt=${lng},${lat}&z=17&l=map`}
        target="_blank"
        rel="noopener noreferrer"
        title={t("orders.modal.openMap")}
        className="absolute right-2 bottom-2 rounded-md bg-white/90 dark:bg-slate-100/90 px-2 py-0.5 font-mono text-xs text-slate-600 hover:text-brand"
      >
        {lat.toFixed(4)}, {lng.toFixed(4)} ↗
      </a>
    </div>
  );
}

function Place({
  title,
  subtitle,
  phone,
}: {
  title: string;
  subtitle?: string | null;
  phone?: string | null;
}) {
  return (
    <div className="mb-2 flex flex-col gap-0.5 border-b border-slate-100 pb-3 text-sm">
      <b>{title}</b>
      {subtitle && <span className="text-[13px] text-slate-500">{subtitle}</span>}
      {phone && (
        <a href={`tel:${phone}`} className="font-mono text-[13px]">
          {phone}
        </a>
      )}
    </div>
  );
}

export function FulfillmentCard({ order }: { order: OrderDetail }) {
  const { t, i18n } = useTranslation();
  const { address, pickup, receiver } = order;
  const lang = i18n.language === "ru" ? "ru" : "uz";

  const items: DescriptionsProps["items"] = [];
  if (receiver.name || receiver.phone) {
    items.push({
      key: "receiver",
      label: t("orders.modal.receiver"),
      children: (
        <span className="flex flex-col items-end">
          {receiver.name && <span>{receiver.name}</span>}
          {receiver.phone && <span className="font-mono">{maskPhone(receiver.phone)}</span>}
        </span>
      ),
    });
  }
  if (pickup?.deadline) {
    items.push({
      key: "deadline",
      label: t("orders.modal.pickupDeadline"),
      children: (
        <span className="flex items-center gap-2">
          {formatDateTime(pickup.deadline)}
          {pickup.expired && (
            <Tag color="red" variant="filled" className="m-0 font-semibold">
              {t("orders.modal.pickupExpired")}
            </Tag>
          )}
        </span>
      ),
    });
  }
  // the project of the order: the API has no link between an order and a project yet (BLD-292)
  items.push({
    key: "project",
    label: t("orders.modal.project"),
    children: <span className="text-slate-400">{t("customers.soon")}</span>,
  });
  if (pickup?.readyAt) {
    items.push({
      key: "readyAt",
      label: t("orders.modal.readyAt"),
      children: formatDateTime(pickup.readyAt),
    });
  }
  if (order.fulfillment === "delivery") {
    items.push({
      key: "yandex",
      label: t("orders.modal.yandex"),
      children: (
        <span className="font-mono">
          {[order.yandexStatus, order.yandexClaimId].filter(Boolean).join(" · ") ||
            t("orders.modal.yandexNone")}
        </span>
      ),
    });
  }

  return (
    <Card
      title={t("orders.modal.fulfillment")}
      extra={
        <b>
          {t(
            order.fulfillment === "pickup"
              ? "orders.modal.pickupStore"
              : `fulfillment.${order.fulfillment}`,
          )}
        </b>
      }
    >
      {address && address.lat !== 0 && <MapPreview lat={address.lat} lng={address.lng} />}
      {address && (
        <Place
          title={address.location || address.name}
          subtitle={address.location ? address.name : null}
        />
      )}
      {pickup && (
        <>
          {pickup.latitude !== null && pickup.longitude !== null && (
            <MapPreview lat={pickup.latitude} lng={pickup.longitude} />
          )}
          <Place
            title={pickup.names[lang] || pickup.names.uz || pickup.names.ru}
            subtitle={pickup.addresses[lang] || pickup.addresses.uz || pickup.addresses.ru}
            phone={pickup.phone}
          />
          {(pickup.landmarks[lang] || pickup.landmarks.uz || pickup.landmarks.ru) && (
            <div className="-mt-1 mb-2 text-xs text-slate-500">
              {t("orders.modal.landmark")}:{" "}
              {pickup.landmarks[lang] || pickup.landmarks.uz || pickup.landmarks.ru}
            </div>
          )}
          {pickup.latitude !== null && pickup.longitude !== null && (
            <a
              href={`https://yandex.uz/maps/?pt=${pickup.longitude},${pickup.latitude}&z=17&l=map`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 inline-block text-sm"
            >
              {t("orders.modal.viewOnMap")} ↗
            </a>
          )}
        </>
      )}
      {items.length > 0 && (
        <Descriptions column={1} size="small" items={items} colon={false} className="info-list" />
      )}
    </Card>
  );
}
