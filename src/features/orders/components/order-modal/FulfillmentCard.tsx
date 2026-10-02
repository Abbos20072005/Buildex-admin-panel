import { Card, Descriptions, type DescriptionsProps } from "antd";
import { useTranslation } from "react-i18next";
import { maskPhone } from "@/shared/lib/format";
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
        className="absolute right-2 bottom-2 rounded-md bg-white/90 px-2 py-0.5 font-mono text-xs text-slate-600 hover:text-brand"
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
  const { t } = useTranslation();
  const { address, branch, receiver } = order;

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
      extra={<b>{t(`fulfillment.${order.fulfillment}`)}</b>}
    >
      {address && address.lat !== 0 && <MapPreview lat={address.lat} lng={address.lng} />}
      {address && (
        <Place
          title={address.location || address.name}
          subtitle={address.location ? address.name : null}
        />
      )}
      {branch && <Place title={branch.name} subtitle={branch.address} phone={branch.phone} />}
      {items.length > 0 && (
        <Descriptions column={1} size="small" items={items} colon={false} className="info-list" />
      )}
    </Card>
  );
}
