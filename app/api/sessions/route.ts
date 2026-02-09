import { NextResponse } from "next/server";
import { createSession, fetchSessions } from "@/lib/api/sessions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sessions = await fetchSessions();
    return NextResponse.json(sessions);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title : "New conversation";
    const session = await createSession({ title });
    return NextResponse.json({ id: session.id, title: session.title });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create session" },
      { status: 500 }
    );
  }
}
