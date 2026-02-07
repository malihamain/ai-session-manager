/**
 * Domain: Session
 * Types and interfaces for AI conversation sessions (DDD-style).
 */

export type SessionId = string;

export interface Session {
  id: SessionId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionInput {
  title: string;
}

export interface SessionRepository {
  list(): Promise<Session[]>;
  getById(id: SessionId): Promise<Session | null>;
  create(input: CreateSessionInput): Promise<Session>;
  update(id: SessionId, updates: Partial<Pick<Session, "title" | "updatedAt">>): Promise<Session>;
  delete(id: SessionId): Promise<void>;
}
