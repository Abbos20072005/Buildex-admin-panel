import { useSyncExternalStore } from "react";
import type { Chat } from "../model/types";

/**
 * The API has no "read" state, so what this browser has already opened is remembered here:
 * per chat, how many messages there were when it was last looked at.
 */
const KEY = "buildex-admin:chat-seen";

type Seen = Record<string, number>;

const listeners = new Set<() => void>();
let cache: Seen | null = null;

function read(): Seen {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Seen;
  } catch {
    cache = {};
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

/** Remember that the chat was seen with `count` messages (never goes backwards). */
export function markSeen(chatId: number, count: number) {
  const current = read();
  if ((current[chatId] ?? -1) >= count) return;
  cache = { ...current, [chatId]: count };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // private mode / full storage: the marks just don't survive a reload
  }
  listeners.forEach((listener) => listener());
}

/** Reactive map of the seen counts. */
export function useSeen(): Seen {
  return useSyncExternalStore(subscribe, read);
}

/** A chat whose newest message is the customer's: somebody is waiting for an answer. */
export const isWaiting = (chat: Chat) => chat.lastMessage !== null && !chat.lastMessage.isAnswer;

/**
 * Customer's messages not yet looked at, like the blue number in Telegram. For a chat never
 * opened in this browser the count is `streak` (the customer's messages in a row at the end,
 * 1 until it is known); once the operator answers, nothing is unread.
 */
export function unreadCount(chat: Chat, seen: Seen, streak?: number): number {
  if (!isWaiting(chat)) return 0;
  const known = seen[chat.id];
  return known === undefined ? Math.max(1, streak ?? 1) : Math.max(0, chat.messagesCount - known);
}
