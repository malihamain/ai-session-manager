"use client";

import { useState } from "react";

interface MessageInputProps {
  sessionId: string;
  onSent: () => void;
}

export function MessageInput({ sessionId, onSent }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) throw new Error(await res.text());
      setContent("");
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          rows={2}
          disabled={loading}
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text)",
            resize: "vertical",
          }}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            background: "var(--accent)",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            alignSelf: "flex-end",
          }}
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
      {error && <p style={{ color: "var(--error)", marginTop: "0.5rem", fontSize: "0.875rem" }}>{error}</p>}
    </form>
  );
}
