import { SessionCard } from "./SessionCard";
import type { Session } from "@/lib/domain";

interface SessionListProps {
  sessions: Session[];
  onSessionDeleted?: () => void;
}

export function SessionList({ sessions, onSessionDeleted }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
        No sessions yet. Use the form above to create one (e.g. type a title and click “New session”), then open it to chat.
      </p>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0 0" }}>
      {sessions.map((s) => (
        <li key={s.id}>
          <SessionCard session={s} onDeleted={onSessionDeleted} />
        </li>
      ))}
    </ul>
  );
}
