import type { Message } from "@/lib/domain";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", padding: "1rem 0" }}>
        No messages yet. Send a message below.
      </p>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {messages.map((m) => (
        <li
          key={m.id}
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "0.5rem",
            borderRadius: "8px",
            background: m.role === "user" ? "var(--accent)" : "var(--bg-elevated)",
            color: m.role === "user" ? "white" : "var(--text)",
            marginLeft: m.role === "user" ? "2rem" : 0,
            marginRight: m.role === "user" ? 0 : "2rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>{m.role}</span>
          <div style={{ marginTop: "0.25rem", whiteSpace: "pre-wrap" }}>{m.content}</div>
        </li>
      ))}
    </ul>
  );
}
