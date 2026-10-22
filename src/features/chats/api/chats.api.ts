import { api, type Page, type Paginated } from "@/shared/api";
import type {
  Chat,
  ChatCustomer,
  ChatListParams,
  ChatMessage,
  ChatStats,
  ReplyInput,
} from "../model/types";

/* ---------- raw shapes of /admin/chats/ and /admin/messages/ ---------- */

interface CustomerDto {
  id: number;
  full_name?: string | null;
  phone_number?: string | null;
}
interface MessageDto {
  id: number;
  chat?: { id: number } | number;
  message?: string | null;
  image?: string | null;
  is_answer: boolean;
  created_at: string;
  updated_at?: string;
}
interface ChatDto {
  id: number;
  customer: CustomerDto | null;
  last_message: MessageDto | null;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

const customer = (dto: CustomerDto | null): ChatCustomer | null =>
  dto ? { id: dto.id, fullName: dto.full_name ?? "", phone: dto.phone_number ?? "" } : null;

const message = (dto: MessageDto): ChatMessage => ({
  id: dto.id,
  chatId: typeof dto.chat === "number" ? dto.chat : (dto.chat?.id ?? 0),
  text: dto.message ?? "",
  image: dto.image || null,
  isAnswer: dto.is_answer,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at ?? dto.created_at,
});

const chat = (dto: ChatDto): Chat => ({
  id: dto.id,
  customer: customer(dto.customer),
  lastMessage: dto.last_message
    ? (({ id, text, image, isAnswer, createdAt }) => ({ id, text, image, isAnswer, createdAt }))(
        message(dto.last_message),
      )
    : null,
  messagesCount: dto.messages_count,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

/** The tab of the list as the API's filters. */
const filterToQuery = (filter: ChatListParams["filter"]) => ({
  unanswered: filter === "unanswered" ? true : undefined,
  is_guest: filter === "guests" ? true : undefined,
});

/** How many messages of a chat are loaded: the newest ones. */
const MESSAGES_LIMIT = 100;

export const chatsApi = {
  /** GET /admin/chats/ — the newest activity first */
  async list({ filter, search, page, pageSize }: ChatListParams): Promise<Page<Chat>> {
    const data = await api.get<Paginated<ChatDto>>("/chats/", {
      ...filterToQuery(filter),
      search: search || undefined,
      page,
      page_size: pageSize,
    });
    return { total: data.count ?? data.results.length, items: data.results.map(chat) };
  },

  /** GET /admin/chats/stats/ — the cards; takes the same filters as the list */
  async stats(): Promise<ChatStats> {
    return api.get<ChatStats>("/chats/stats/");
  },

  /** GET /admin/chats/{id}/ */
  async get(id: number): Promise<Chat> {
    return chat(await api.get<ChatDto>(`/chats/${id}/`));
  },

  /** POST /admin/chats/ — an empty chat with a customer; 400 when the customer already has one */
  async create(customerId: number): Promise<Chat> {
    return chat(await api.post<ChatDto>("/chats/", { customer: customerId }));
  },

  /** DELETE /admin/chats/{id}/ — the messages go with it (their picture files stay on the disk) */
  async remove(id: number): Promise<void> {
    await api.delete(`/chats/${id}/`);
  },

  /** GET /admin/messages/?chat= — the newest {MESSAGES_LIMIT}, returned oldest first */
  async messages(chatId: number): Promise<ChatMessage[]> {
    const data = await api.get<Paginated<MessageDto>>("/messages/", {
      chat: chatId,
      ordering: "-created_at",
      page_size: MESSAGES_LIMIT,
    });
    return data.results.map(message).reverse();
  },

  /**
   * How many of the newest messages in a row are the customer's (nobody has answered them yet):
   * the "new messages" number of a chat that was never opened in this browser.
   */
  async unansweredStreak(chatId: number): Promise<number> {
    const data = await api.get<Paginated<MessageDto>>("/messages/", {
      chat: chatId,
      ordering: "-created_at",
      page_size: 50,
    });
    const answered = data.results.findIndex((item) => item.is_answer);
    return answered === -1 ? data.results.length : answered;
  },

  /** POST /admin/messages/ — always an operator's answer; a text, a picture, or both */
  async reply({ chatId, text, image }: ReplyInput): Promise<ChatMessage> {
    if (image) {
      const form = new FormData();
      form.append("chat", String(chatId));
      if (text) form.append("message", text);
      form.append("image", image);
      return message(await api.upload<MessageDto>("/messages/", form));
    }
    return message(await api.post<MessageDto>("/messages/", { chat: chatId, message: text }));
  },

  /** PATCH /admin/messages/{id}/ — only an operator's own answer can be edited */
  async editMessage(id: number, text: string): Promise<ChatMessage> {
    return message(await api.patch<MessageDto>(`/messages/${id}/`, { message: text }));
  },

  /** DELETE /admin/messages/{id}/ — its picture file is deleted too */
  async removeMessage(id: number): Promise<void> {
    await api.delete(`/messages/${id}/`);
  },
};
