import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { maskPhone } from "@/shared/lib/format";
import type { Customer, CustomerAddress } from "../../model/types";

/** "kv. 4 · 2-kirish · 3-qavat · domofon 1234": what the courier needs besides the street. */
const detailsLine = (address: CustomerAddress, t: TFunction) =>
  [
    address.apartment && t("customers.addressParts.apartment", { value: address.apartment }),
    address.entrance && t("customers.addressParts.entrance", { value: address.entrance }),
    address.floor && t("customers.addressParts.floor", { value: address.floor }),
    address.intercom && t("customers.addressParts.intercom", { value: address.intercom }),
  ]
    .filter(Boolean)
    .join(" · ");

/** The saved addresses; the customer manages them in the app or on the site, the admin only reads. */
export function AddressesTab({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="mt-0 mb-3 text-xs text-slate-500">{t("customers.addressesHint")}</p>
      {customer.addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          {t("customers.noAddresses")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customer.addresses.map((address) => (
            <article
              key={address.id}
              className={`rounded-xl border bg-white p-4 ${address.isDefault ? "border-brand" : "border-slate-200"}`}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="font-bold">{address.name}</span>
                {address.isDefault && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                    {t("customers.defaultAddress")}
                  </span>
                )}
              </div>
              <div className="text-sm">{address.locationName || "—"}</div>
              <div className="mt-1 text-xs text-slate-500">{detailsLine(address, t)}</div>
              {/* the recipient of the order; empty on the address — the customer himself */}
              <div className="mt-2 flex gap-2 text-xs text-slate-500">
                <span>{address.recipientName || customer.fullName || "—"}</span>
                <span className="font-mono">
                  {maskPhone(address.recipientPhone || customer.phone)}
                </span>
              </div>
              {address.courierComment && (
                <div className="mt-1 text-xs text-slate-500">{address.courierComment}</div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
