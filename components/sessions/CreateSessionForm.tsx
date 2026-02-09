"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateSessionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("New conversation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Failed to create session",
        );
      const id = data?.id;
      if (typeof id !== "string" || !id.trim()) {
        setError("Server did not return a session id. Please try again.");
        return;
      }
      router.push(`/sessions/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Session title"
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text)",
            minWidth: "200px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            background: "var(--accent)",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating…" : "New session"}
        </button>
      </div>
      {error && (
        <p
          style={{
            color: "var(--error)",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
