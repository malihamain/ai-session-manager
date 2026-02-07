"use client";

import { useEffect, useState } from "react";
import { CreateSessionForm } from "@/components/sessions/CreateSessionForm";
import { SessionList } from "@/components/sessions/SessionList";
import type { Session } from "@/lib/domain";

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSessions() {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <>
      <h1>Sessions</h1>
      <CreateSessionForm />
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading sessions…</p>
      ) : (
        <SessionList sessions={sessions} onSessionDeleted={loadSessions} />
      )}
    </>
  );
}
