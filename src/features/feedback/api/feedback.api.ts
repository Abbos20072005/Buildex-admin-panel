import { api, type Page, type Paginated } from "@/shared/api";
import type {
  FeedbackCustomer,
  FeedbackItem,
  FeedbackKind,
  FeedbackListParams,
  FeedbackProduct,
  FeedbackReply,
  FeedbackStats,
} from "../model/types";

/* ---------- raw shapes of /admin/comments/, /admin/questions/ and their replies ---------- */

interface CustomerDto {
  id: number;
  full_name?: string | null;
  phone_number?: string | null;
}
interface ProductDto {
  id: number;
  name: string;
  product_code?: string | null;
}
interface ReplyDto {
  id: number;
  customer?: CustomerDto | null;
  /** a review's answer */
  reply_comment?: string;
  /** a question's answer */
  answer?: string;
  is_admin: boolean;
  is_visible?: boolean;
  created_at: string;
}
interface ItemDto {
  id: number;
  customer?: CustomerDto | null;
  product?: ProductDto | null;
  product_rating?: number;
  /** a review */
  comment?: string;
  /** a question */
  question?: string;
  is_visible?: boolean;
  images?: { id: number; image: string }[];
  replies_count?: number;
  replies?: ReplyDto[];
  created_at: string;
}
interface StatsDto {
  total: number;
  visible: number;
  hidden: number;
  unanswered: number;
  average_rating?: number | null;
}

/** The two kinds differ only by the paths and the names of the text fields. */
const CONFIG = {
  reviews: { path: "/comments/", replies: "/comment-replies/", parent: "comment", text: "reply_comment" },
  questions: { path: "/questions/", replies: "/question-replies/", parent: "question", text: "answer" },
} as const;

const customer = (dto: CustomerDto | null | undefined): FeedbackCustomer | null =>
  dto ? { id: dto.id, fullName: dto.full_name ?? "", phone: dto.phone_number ?? "" } : null;

const product = (dto: ProductDto | null | undefined): FeedbackProduct | null =>
  dto ? { id: dto.id, name: dto.name, code: dto.product_code ?? "" } : null;

const reply = (kind: FeedbackKind, dto: ReplyDto): FeedbackReply => ({
  id: dto.id,
  text: (kind === "reviews" ? dto.reply_comment : dto.answer) ?? "",
  isAdmin: dto.is_admin,
  isVisible: dto.is_visible ?? true,
  authorName: dto.customer?.full_name ?? "",
  createdAt: dto.created_at,
});

const item = (kind: FeedbackKind, dto: ItemDto): FeedbackItem => ({
  id: dto.id,
  kind,
  customer: customer(dto.customer),
  product: product(dto.product),
  rating: kind === "reviews" ? (dto.product_rating ?? null) : null,
  text: (kind === "reviews" ? dto.comment : dto.question) ?? "",
  images: (dto.images ?? []).map((picture) => picture.image),
  isVisible: dto.is_visible ?? true,
  repliesCount: dto.replies_count ?? dto.replies?.length ?? 0,
  replies: dto.replies ? dto.replies.map((entry) => reply(kind, entry)) : null,
  createdAt: dto.created_at,
});

/** The tab of the list as the API's filters. */
const filterToQuery = (filter: FeedbackListParams["filter"]) => ({
  answered: filter === "unanswered" ? false : filter === "answered" ? true : undefined,
  is_visible: filter === "hidden" ? false : undefined,
});

export const feedbackApi = {
  /** GET /admin/comments/ or /admin/questions/ — the newest first */
  async list(
    kind: FeedbackKind,
    { filter, search, rating, page, pageSize }: FeedbackListParams,
  ): Promise<Page<FeedbackItem>> {
    const data = await api.get<Paginated<ItemDto>>(CONFIG[kind].path, {
      ...filterToQuery(filter),
      search: search || undefined,
      product_rating: kind === "reviews" ? rating : undefined,
      ordering: "-created_at",
      page,
      page_size: pageSize,
    });
    return {
      total: data.count ?? data.results.length,
      items: data.results.map((entry) => item(kind, entry)),
    };
  },

  /** GET …/stats/ — the cards */
  async stats(kind: FeedbackKind): Promise<FeedbackStats> {
    const data = await api.get<StatsDto>(`${CONFIG[kind].path}stats/`);
    return {
      total: data.total,
      visible: data.visible,
      hidden: data.hidden,
      unanswered: data.unanswered,
      averageRating: kind === "reviews" ? (data.average_rating ?? null) : null,
    };
  },

  /** GET …/{id}/ — the item with its answers */
  async get(kind: FeedbackKind, id: number): Promise<FeedbackItem> {
    return item(kind, await api.get<ItemDto>(`${CONFIG[kind].path}${id}/`));
  },

  /** PATCH …/{id}/ — shows the item on the site or hides it */
  async setVisible(kind: FeedbackKind, id: number, isVisible: boolean): Promise<void> {
    await api.patch(`${CONFIG[kind].path}${id}/`, { is_visible: isVisible });
  },

  /** DELETE …/{id}/ — the answers go with it */
  async remove(kind: FeedbackKind, id: number): Promise<void> {
    await api.delete(`${CONFIG[kind].path}${id}/`);
  },

  /** POST /admin/comment-replies/ or /admin/question-replies/ — the shop's answer */
  async reply(kind: FeedbackKind, itemId: number, text: string): Promise<FeedbackReply> {
    const { replies, parent, text: field } = CONFIG[kind];
    return reply(
      kind,
      await api.post<ReplyDto>(replies, { [parent]: { id: itemId }, [field]: text, is_visible: true }),
    );
  },

  /** PATCH …-replies/{id}/ */
  async editReply(kind: FeedbackKind, id: number, text: string): Promise<void> {
    const { replies, text: field } = CONFIG[kind];
    await api.patch(`${replies}${id}/`, { [field]: text });
  },

  /** DELETE …-replies/{id}/ */
  async removeReply(kind: FeedbackKind, id: number): Promise<void> {
    await api.delete(`${CONFIG[kind].replies}${id}/`);
  },
};
