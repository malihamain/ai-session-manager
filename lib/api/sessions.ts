/**
 * Session API: uses domain repositories, handles loading/errors.
 */

import { sessionStore } from "@/lib/storage/session-store";
import { deleteBySessionId } from "@/lib/storage/message-store";
import type { Session, CreateSessionInput } from "@/lib/domain";

export async function fetchSessions(): Promise<Session[]> {
  return sessionStore.list();
}

export async function fetchSessionById(id: string): Promise<Session | null> {
  return sessionStore.getById(id);
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  return sessionStore.create(input);
}

export async function deleteSession(id: string): Promise<void> {
  deleteBySessionId(id);
  return sessionStore.delete(id);
}
