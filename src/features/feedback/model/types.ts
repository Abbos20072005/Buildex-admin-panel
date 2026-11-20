/** What customers leave on a product page: a review (with a rating) or a question. */
export type FeedbackKind = "reviews" | "questions";

export interface FeedbackCustomer {
  id: number;
  fullName: string;
  phone: string;
}

export interface FeedbackProduct {
  id: number;
  name: string;
  code: string;
}

/** An answer under a review or a question: written by the shop (isAdmin) or by a customer. */
export interface FeedbackReply {
  id: number;
  text: string;
  isAdmin: boolean;
  isVisible: boolean;
  authorName: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: number;
  kind: FeedbackKind;
  customer: FeedbackCustomer | null;
  product: FeedbackProduct | null;
  /** 1–5, reviews only */
  rating: number | null;
  text: string;
  /** pictures of a review */
  images: string[];
  isVisible: boolean;
  repliesCount: number;
  /** only the opened item brings its answers */
  replies: FeedbackReply[] | null;
  createdAt: string;
}

export interface FeedbackStats {
  total: number;
  visible: number;
  hidden: number;
  /** nobody from the shop has answered */
  unanswered: number;
  /** reviews only */
  averageRating: number | null;
}

/** What the table shows: everything, the answered ones, the ones waiting for an answer, or the hidden. */
export type FeedbackFilter = "all" | "unanswered" | "answered" | "hidden";

export interface FeedbackListParams {
  filter: FeedbackFilter;
  search?: string;
  /** reviews only: 1–5 */
  rating?: number;
  page: number;
  pageSize: number;
}
