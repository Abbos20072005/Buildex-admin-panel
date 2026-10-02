/** Raw shapes of the Dommaster Admin API (see swagger/admin → schemas Order, OrderList, …). */

export interface OrderCustomerDto {
  id: number;
  full_name?: string;
  phone_number?: string;
}

export interface OrderListDto {
  id: number;
  customer: OrderCustomerDto | null;
  status: number;
  payment_status?: number;
  payment_type?: number | null;
  payment_method?: string | null;
  delivery_type?: number;
  total_price?: number;
  products_total_price?: number;
  saved_price?: number;
  delivery_price?: string | number | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  items_count?: number;
  created_at: string;
  updated_at?: string;
}

/** GET /admin/managers/ */
export interface ManagerDto {
  id: number;
  full_name: string;
  is_active?: boolean;
}

export interface CommentAuthorDto {
  id: number;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
}

/** Item of `comments` in the order detail / response of POST /admin/order-comments/ */
export interface OrderCommentDto {
  id: number;
  author: CommentAuthorDto | null;
  text: string;
  is_system: boolean;
  created_at: string;
}

export interface OrderDto extends OrderListDto {
  manager?: ManagerDto | null;
  comments?: OrderCommentDto[];
  order_location?: {
    id: number;
    name: string;
    location_name: string | null;
    latitude: number;
    longitude: number;
  } | null;
  pickup_branch?: {
    id: number;
    name: string;
    address: string | null;
    phone_number: string | null;
  } | null;
  promocode?: {
    id: number;
    name: string;
    code: string;
    discount_precent: number | null;
    discount_price: number | null;
    expires_at?: string | null;
  } | null;
  items?: {
    id: number;
    quantity?: number;
    product: {
      id: number;
      name: string;
      product_code: string | null;
      price: number;
      discount_price: number | null;
    };
  }[];
  ofd_url?: string | null;
  yandex_claim_id?: string | null;
  yandex_claim_status?: string | null;
  hold_id?: number | null;
}

export type OrderStatsDto = Partial<
  Record<
    | "total"
    | "pending"
    | "collecting"
    | "delivering"
    | "completed"
    | "canceled"
    | "paid"
    | "revenue"
    | "average_check",
    number
  >
>;

export interface CustomerDto {
  id: number;
  full_name?: string;
  phone_number?: string;
  email?: string | null;
  role?: string;
  verified?: boolean;
  is_blocked?: boolean;
  orders_count?: number;
  total_purchase?: number;
  created_at?: string;
}

export interface BranchDto {
  id: number;
  name: string;
}
