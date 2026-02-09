/**
 * Session store implementation.
 *
 * - In production (REDIS_URL set), uses Redis so sessions persist across
 *   deploys and serverless instances.
 * - In local dev without Redis, falls back to in-memory Map for simplicity.
 */

import type { Session, SessionRepository, CreateSessionInput } from "@/lib/domain";
import { getRedis } from "@/lib/redis";

const SESSION_KEY_PREFIX = "session:";
const SESSION_INDEX_KEY = "sessions:index";

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

type SessionRecord = Omit<Session, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

function toRecord(session: Session): SessionRecord {
  return {
    ...session,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

function fromRecord(record: SessionRecord): Session {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

// In-memory fallback for local dev without Redis.
const globalForStore = globalThis as unknown as { __sessionStore?: Map<string, Session> };
const memoryStore = globalForStore.__sessionStore ?? new Map<string, Session>();
if (!globalForStore.__sessionStore) globalForStore.__sessionStore = memoryStore;

export const sessionStore: SessionRepository = {
  async list() {
    const redis = await getRedis();
    if (!redis) {
      return Array.from(memoryStore.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    const ids: string[] = await redis.zRange(SESSION_INDEX_KEY, 0, -1, {
      REV: true,
    });
    if (!ids || ids.length === 0) return [];

    const keys = ids.map((id) => `${SESSION_KEY_PREFIX}${id}`);
    const results = await redis.mGet(keys);

    const sessions: Session[] = [];
    results.forEach((raw: unknown, idx: number) => {
      if (typeof raw === "string") {
        try {
          const rec = JSON.parse(raw) as SessionRecord;
          sessions.push(fromRecord(rec));
        } catch {
          // ignore malformed
        }
      } else {
        // clean index if value missing
        const id = ids[idx];
        if (id) {
          void redis.zRem(SESSION_INDEX_KEY, id);
        }
      }
    });
    return sessions;
  },

  async getById(id: string) {
    const redis = await getRedis();
    if (!redis) {
      return memoryStore.get(id) ?? null;
    }
    const raw = await redis.get(`${SESSION_KEY_PREFIX}${id}`);
    if (!raw) return null;
    try {
      const rec = JSON.parse(raw) as SessionRecord;
      return fromRecord(rec);
    } catch {
      return null;
    }
  },

  async create(input: CreateSessionInput) {
    const now = new Date();
    const session: Session = {
      id: generateId(),
      title: input.title,
      createdAt: now,
      updatedAt: now,
    };

    const redis = await getRedis();
    if (!redis) {
      memoryStore.set(session.id, session);
      return session;
    }

    const record = toRecord(session);
    const key = `${SESSION_KEY_PREFIX}${session.id}`;
    await redis
      .multi()
      .set(key, JSON.stringify(record))
      .zAdd(SESSION_INDEX_KEY, {
        score: now.getTime(),
        value: session.id,
      })
      .exec();

    return session;
  },

  async update(id: string, updates: Partial<Pick<Session, "title" | "updatedAt">>) {
    const redis = await getRedis();
    if (!redis) {
      const existing = memoryStore.get(id);
      if (!existing) throw new Error(`Session not found: ${id}`);
      const updated: Session = {
        ...existing,
        ...updates,
        updatedAt: updates.updatedAt ?? new Date(),
      };
      memoryStore.set(id, updated);
      return updated;
    }

    const existing = await this.getById(id);
    if (!existing) throw new Error(`Session not found: ${id}`);

    const updated: Session = {
      ...existing,
      ...updates,
      updatedAt: updates.updatedAt ?? new Date(),
    };

    const record = toRecord(updated);
    const key = `${SESSION_KEY_PREFIX}${id}`;

    await redis
      .multi()
      .set(key, JSON.stringify(record))
      .zAdd(SESSION_INDEX_KEY, {
        score: updated.updatedAt.getTime(),
        value: id,
      })
      .exec();

    return updated;
  },

  async delete(id: string) {
    const redis = await getRedis();
    if (!redis) {
      memoryStore.delete(id);
      return;
    }
    const key = `${SESSION_KEY_PREFIX}${id}`;
    await redis
      .multi()
      .del(key)
      .zRem(SESSION_INDEX_KEY, id)
      .exec();
  },
};


