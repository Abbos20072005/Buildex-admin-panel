import { Navigate, useParams } from "react-router-dom";
import { CustomerDetail } from "@/features/customers";

/** /customers/:id — one customer: counters and the tabs (profile, orders, addresses, …). */
export function CustomerPage() {
  const id = Number(useParams().id);
  if (!Number.isInteger(id) || id <= 0) return <Navigate to="/customers" replace />;
  // key: another customer starts from the first tab
  return <CustomerDetail key={id} id={id} />;
}
