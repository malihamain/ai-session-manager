"use client";

import Link from "next/link";
import { useState } from "react";
import type { Session } from "@/lib/domain";

interface SessionCardProps {
  session: Session;
  onDeleted?: () => void;
}

export function SessionCard({ session, onDeleted }: SessionCardProps) {
  const [deleting, setDeleting] = useState(false);
  const raw = session.updatedAt ?? session.createdAt;
  const date =
    raw != null && !Number.isNaN(Date.parse(String(raw)))
      ? new Date(raw).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—";

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "DELETE",
      });
      if (res.ok) onDeleted?.();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.75rem",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        overflow: "hidden",
      }}
    >
      <Link
        href={`/sessions/${session.id}`}
        style={{
          flex: 1,
          padding: "1rem 1.25rem",
          color: "var(--text)",
          textDecoration: "none",
        }}
      >
        <strong style={{ fontSize: "1rem" }}>{session.title}</strong>
        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            marginTop: "0.25rem",
          }}
        >
          Updated {date}
        </div>
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        aria-label="Delete session"
        style={{
          marginRight: "0.75rem",
          padding: "0.5rem",
          border: "none",
          borderRadius: "6px",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: deleting ? "not-allowed" : "pointer",
          fontSize: "1.125rem",
        }}
        title="Delete session"
      >
        ×
      </button>
    </div>
  );
}
