export { customerColumns } from "./components/columns";
export { CustomerEditor } from "./components/CustomerEditor";
export { CustomerStatsCards } from "./components/CustomerStatsCards";
export {
  useCustomersQuery,
  useCustomerStatsQuery,
  useDeleteCustomer,
  useBulkSetCustomerBlocked,
} from "./hooks/queries";
export { CUSTOMER_ROLES } from "./model/types";
export type { Customer, CustomerFilters, CustomerRole } from "./model/types";
