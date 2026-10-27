/** Customer of a chat; a chat without one belongs to a guest (a browser with a `chat_token`). */
export interface ChatCustomer {
  id: number;
  fullName: string;
  phone: string;
}

export interface ChatMessage {
  id: number;
  chatId: number;
  text: string;
  image: string | null;
  /** true — written by an operator, false — by the customer */
  isAnswer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: number;
  customer: ChatCustomer | null;
  lastMessage: Pick<ChatMessage, "id" | "text" | "image" | "isAnswer" | "createdAt"> | null;
  messagesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatStats {
  total: number;
  /** the last message is the customer's */
  unanswered: number;
  guests: number;
}

/** What the list shows: everything, the chats waiting for an answer, or the guests'. */
export type ChatFilter = "all" | "unanswered" | "guests";

export interface ChatListParams {
  filter: ChatFilter;
  search?: string;
  /** only the chats of this customer */
  customer?: number;
  page: number;
  pageSize: number;
}

export interface ReplyInput {
  chatId: number;
  text: string;
  image?: File;
}
