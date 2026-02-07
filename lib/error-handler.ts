/**
 * Error monitoring: Sentry simulation.
 * Captures errors and logs them (in production you would send to Sentry).
 */

export type ErrorLevel = "error" | "warning" | "info";

export interface CapturedError {
  message: string;
  level: ErrorLevel;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const captured: CapturedError[] = [];

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const entry: CapturedError = {
    message,
    level: "error",
    stack,
    context,
    timestamp: new Date().toISOString(),
  };
  captured.push(entry);
  if (typeof window !== "undefined") {
    console.error("[Sentry simulation]", entry);
  } else {
    console.error("[Sentry simulation]", entry);
  }
}

export function captureMessage(message: string, level: ErrorLevel = "info"): void {
  captured.push({
    message,
    level,
    timestamp: new Date().toISOString(),
  });
}

export function getCapturedErrors(): readonly CapturedError[] {
  return captured;
}

export function clearCapturedErrors(): void {
  captured.length = 0;
}
