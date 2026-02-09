/**
 * Message store implementation.
 *
 * - In production (REDIS_URL set), uses Redis so messages persist across
 *   deploys and serverless instances.
 * - In local dev without Redis, falls back to in-memory Map for simplicity.
 */

import type { Message, MessageRepository, CreateMessageInput } from "@/lib/domain";
import { getRedis } from "@/lib/redis";

const MESSAGE_LIST_PREFIX = "messages:";

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

type MessageRecord = Omit<Message, "createdAt"> & { createdAt: string };

function toRecord(message: Message): MessageRecord {
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
  };
}

function fromRecord(record: MessageRecord): Message {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
  };
}

// In-memory fallback for local dev without Redis.
const globalForStore = globalThis as unknown as { __messageStore?: Map<string, Message[]> };
const memoryStore = globalForStore.__messageStore ?? new Map<string, Message[]>();
if (!globalForStore.__messageStore) globalForStore.__messageStore = memoryStore;

function getMemoryList(sessionId: string): Message[] {
  if (!memoryStore.has(sessionId)) memoryStore.set(sessionId, []);
  return memoryStore.get(sessionId)!;
}

export const messageStore: MessageRepository = {
  async listBySessionId(sessionId: string) {
    const redis = await getRedis();
    if (!redis) {
      return getMemoryList(sessionId).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    const key = `${MESSAGE_LIST_PREFIX}${sessionId}`;
    const rawList = await redis.lRange(key, 0, -1);
    if (!rawList || rawList.length === 0) return [];

    const records: MessageRecord[] = [];
    for (const raw of rawList) {
      if (typeof raw === "string") {
        try {
          records.push(JSON.parse(raw) as MessageRecord);
        } catch {
          // ignore malformed
        }
      }
    }
    return records
      .map(fromRecord)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },

  async create(input: CreateMessageInput) {
    const redis = await getRedis();
    const message: Message = {
      id: generateId(),
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      createdAt: new Date(),
    };

    if (!redis) {
      const list = getMemoryList(input.sessionId);
      list.push(message);
      return message;
    }

    const key = `${MESSAGE_LIST_PREFIX}${input.sessionId}`;
    const record = toRecord(message);
    await redis.rPush(key, JSON.stringify(record));
    return message;
  },
};

export async function deleteBySessionId(sessionId: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) {
    memoryStore.delete(sessionId);
    return;
  }
  const key = `${MESSAGE_LIST_PREFIX}${sessionId}`;
  await redis.del(key);
}


