/**
 * In-memory message store. Implements MessageRepository.
 * Uses globalThis so the same store is used across HMR/reloads in dev.
 */

import type { Message, MessageRepository, CreateMessageInput } from "@/lib/domain";

const globalForStore = globalThis as unknown as { __messageStore?: Map<string, Message[]> };
const store = globalForStore.__messageStore ?? new Map<string, Message[]>();
if (!globalForStore.__messageStore) globalForStore.__messageStore = store;

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getList(sessionId: string): Message[] {
  if (!store.has(sessionId)) store.set(sessionId, []);
  return store.get(sessionId)!;
}

export const messageStore: MessageRepository = {
  async listBySessionId(sessionId: string) {
    return getList(sessionId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  async create(input: CreateMessageInput) {
    const list = getList(input.sessionId);
    const message: Message = {
      id: generateId(),
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      createdAt: new Date(),
    };
    list.push(message);
    return message;
  },
};

export function deleteBySessionId(sessionId: string): void {
  store.delete(sessionId);
}
