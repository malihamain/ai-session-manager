import { createClient } from "redis";

/**
 * Shared Redis client (using REDIS_URL).
 *
 * - In production on Vercel, set REDIS_URL in Environment Variables.
 * - In local dev, you can either set REDIS_URL or let the app fall back
 *   to in-memory stores (session/message stores handle that).
 */

// Typed as `any` to avoid bringing in the full Redis generic types into
// the app's type surface – we only use a small subset of commands.
let client: any | null = null;
let connecting: Promise<any> | null = null;

export async function getRedis(): Promise<any | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (client) return client;
  if (!connecting) {
    connecting = (async () => {
      const c = createClient({ url });
      c.on("error", (err) => {
        console.error("[redis] client error", err);
      });
      await c.connect();
      client = c;
      return c;
    })();
  }
  return connecting;
}


