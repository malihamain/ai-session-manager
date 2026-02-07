"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageList } from "@/components/sessions/MessageList";
import { MessageInput } from "@/components/sessions/MessageInput";
import type { Message } from "@/lib/domain";

export default function SessionPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function loadSessionAndMessages() {
    if (!id) return;
    try {
      const [sessionRes, messagesRes] = await Promise.all([
        fetch(`/api/sessions/${id}`),
        fetch(`/api/sessions/${id}/messages`),
      ]);
      if (sessionRes.status === 404) {
        setNotFound(true);
        return;
      }
      if (!sessionRes.ok || !messagesRes.ok) {
        setNotFound(true);
        return;
      }
      const session = await sessionRes.json();
      const messagesData = await messagesRes.json();
      setSessionTitle(session.title);
      setMessages(messagesData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadSessionAndMessages();
    else setLoading(false);
  }, [id]);

  if (!id) {
    return (
      <div style={{ padding: "1rem" }}>
        <p style={{ color: "var(--error)" }}>Invalid session.</p>
        <Link href="/">Back to sessions</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <p style={{ color: "var(--text-muted)", padding: "1rem" }}>Loading…</p>
    );
  }

  if (notFound) {
    return (
      <div style={{ padding: "1rem" }}>
        <p style={{ color: "var(--error)" }}>Session not found.</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Sessions are stored in memory and are cleared when the app restarts. Create a new session to continue.
        </p>
        <Link href="/" style={{ display: "inline-block", marginTop: "0.75rem" }}>← Back to sessions</Link>
      </div>
    );
  }

  return (
    <>
      <p style={{ marginBottom: "1rem" }}>
        <Link
          href="/"
          style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}
        >
          ← Back to sessions
        </Link>
      </p>
      <h1>{sessionTitle ?? "Chat"}</h1>
      <MessageList messages={messages} />
      <MessageInput sessionId={id} onSent={() => loadSessionAndMessages()} />
    </>
  );
}
