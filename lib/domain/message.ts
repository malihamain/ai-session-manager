/**
 * Domain: Message
 * Types for conversation messages (DDD-style).
 */

export type MessageId = string;
export type Role = "user" | "assistant";

export interface Message {
  id: MessageId;
  sessionId: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export interface CreateMessageInput {
  sessionId: string;
  role: Role;
  content: string;
}

export interface MessageRepository {
  listBySessionId(sessionId: string): Promise<Message[]>;
  create(input: CreateMessageInput): Promise<Message>;
}
