/**
 * In-memory session store (can be swapped for DB/API later).
 * Implements SessionRepository from domain.
 * Uses globalThis so the same store is used across HMR/reloads in dev.
 */

import type { Session, SessionRepository, CreateSessionInput } from "@/lib/domain";

const globalForStore = globalThis as unknown as { __sessionStore?: Map<string, Session> };
const store = globalForStore.__sessionStore ?? new Map<string, Session>();
if (!globalForStore.__sessionStore) globalForStore.__sessionStore = store;

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const sessionStore: SessionRepository = {
  async list() {
    return Array.from(store.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getById(id: string) {
    return store.get(id) ?? null;
  },

  async create(input: CreateSessionInput) {
    const now = new Date();
    const session: Session = {
      id: generateId(),
      title: input.title,
      createdAt: now,
      updatedAt: now,
    };
    store.set(session.id, session);
    return session;
  },

  async update(id: string, updates: Partial<Pick<Session, "title" | "updatedAt">>) {
    const existing = store.get(id);
    if (!existing) throw new Error(`Session not found: ${id}`);
    const updated: Session = {
      ...existing,
      ...updates,
      updatedAt: updates.updatedAt ?? new Date(),
    };
    store.set(id, updated);
    return updated;
  },

  async delete(id: string) {
    store.delete(id);
  },
};
