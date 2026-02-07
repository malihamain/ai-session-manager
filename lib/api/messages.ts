/**
 * Messages API: list, add user message, get AI reply and persist.
 */

import { messageStore } from "@/lib/storage/message-store";
import { getAiReply } from "@/lib/api/gemini";
import type { Message, CreateMessageInput } from "@/lib/domain";
import { captureException } from "@/lib/error-handler";

export async function fetchMessagesBySessionId(sessionId: string): Promise<Message[]> {
  return messageStore.listBySessionId(sessionId);
}

export async function addMessage(input: CreateMessageInput): Promise<Message> {
  return messageStore.create(input);
}

export async function sendUserMessageAndGetReply(
  sessionId: string,
  userContent: string
): Promise<{ userMessage: Message; assistantMessage: Message }> {
  const userMessage = await messageStore.create({
    sessionId,
    role: "user",
    content: userContent,
  });

  const reply = await getAiReply(userContent);
  if (!reply.success) {
    captureException(new Error(reply.error ?? "AI request failed"), { sessionId });
    const fallbackContent = `Sorry, something went wrong: ${reply.error ?? "Unknown error"}.`;
    const assistantMessage = await messageStore.create({
      sessionId,
      role: "assistant",
      content: fallbackContent,
    });
    return { userMessage, assistantMessage };
  }

  const assistantMessage = await messageStore.create({
    sessionId,
    role: "assistant",
    content: reply.text,
  });
  return { userMessage, assistantMessage };
}
