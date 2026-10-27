/**
 * What the admin API of customers can do today. The customer pages are built to the design, but some
 * of its parts need fields and endpoints the backend does not have yet (docs/customers-backend-request.md).
 * Those parts stay switched off (disabled, "soon") instead of showing a wrong or empty result.
 * When the backend ships one, set its flag to `true` — nothing else has to change.
 */
export const CUSTOMER_API = {
  /** `deleted` in /customers/stats/ and `is_deleted` in the list */
  deletedCustomers: false,
  /** `ordered_30d` in /customers/stats/ */
  orderedStat: false,
  /** `segment`, `tags` in the customer + the `segment` filter + PATCH of them */
  segments: false,
  /** `registration_channel` in the customer + the `registration_channel` filter */
  registrationChannel: false,
  /** `orders_min`/`orders_max`, `purchase_min`/`purchase_max`, `last_order_from`/`last_order_to` filters, `last_order_at` */
  rangeFilters: false,
  /** `returns_count`, the `has_returns` filter and GET /admin/returns/?customer= */
  returns: false,
  /** GET/POST /admin/customers/{id}/notes/ */
  notes: false,
  /** `language`, `email` in PATCH */
  profileFields: false,
  /** `last_login_platform`, `active_devices`, POST /admin/customers/{id}/logout-all/ */
  devices: false,
  /** `consents` in the customer */
  consents: false,
} as const;
