/**
 * What the admin API of customers can do. The backend now has everything the customer pages
 * need except the consents (push / sms / email), which it does not store: that card stays off,
 * "Backend kutilmoqda". A flag that is `true` is always on; it is kept so that a part can be
 * switched off again in one place.
 */
export const CUSTOMER_API = {
  /** `deleted` in /customers/stats/ and `is_deleted` in the list (soft delete) */
  deletedCustomers: true,
  /** `ordered_30d` in /customers/stats/ */
  orderedStat: true,
  /** `segment`, `tags` in the customer + the `segment` filter + PATCH of them */
  segments: true,
  /** `registration_channel` in the customer + the `registration_channel` filter */
  registrationChannel: true,
  /** `orders_min`/`orders_max`, `purchase_min`/`purchase_max`, `last_order_from`/`last_order_to` filters, `last_order_at` */
  rangeFilters: true,
  /** `returns_count`, the `has_returns` filter (both count the cancelled orders: there is no returns model) */
  returns: true,
  /** GET/POST/DELETE /admin/customers/{id}/notes/ */
  notes: true,
  /** `language`, `email` in PATCH */
  profileFields: true,
  /** `last_login_platform`, `active_devices`, POST /admin/customers/{id}/logout-all/ */
  devices: true,
  /** `consents` in the customer: the backend does not store them */
  consents: false,
} as const;
