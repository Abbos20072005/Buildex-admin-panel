import { useCustomerPhone } from "@/features/customers";
import { formatPhone, telHref } from "@/shared/lib/format";

/** The whole phone number as a tel: link (BLD-543); a masked one is asked from the server. */
export function PhoneReveal({ phone, customerId }: { phone: string; customerId: number | null }) {
  const whole = useCustomerPhone(customerId, phone);

  if (!whole) return <>—</>;

  return (
    <a href={telHref(whole)} className="font-mono">
      {formatPhone(whole)}
    </a>
  );
}
