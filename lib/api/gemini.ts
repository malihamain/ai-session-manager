/**
 * Gemini AI client (free tier).
 * Uses @google/generative-ai. Set GEMINI_API_KEY in .env.local.
 * Falls back to mock response if no key or in test.
 */

export interface ChatResponse {
  text: string;
  success: boolean;
  error?: string;
}

/** Simulated delay (ms) for loading/error demo. Set to 0 to disable. */
export const MOCK_DELAY_MS = process.env.NEXT_PUBLIC_MOCK_DELAY_MS
  ? parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MS, 10)
  : 0;

/** Simulate failure for error-handling demo. */
export const MOCK_FAIL = process.env.NEXT_PUBLIC_MOCK_FAIL === "true";

async function delay(ms: number): Promise<void> {
  if (ms <= 0) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_MESSAGE =
  "[Mock] No GEMINI_API_KEY set. Add it in .env.local to use real Gemini.";

async function sendToGemini(userMessage: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_FORCE_MOCK_GEMINI === "true") {
    return MOCK_MESSAGE;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return MOCK_MESSAGE;
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(key);
  // Prefer model with higher free-tier limits (gemini-2.5-flash-lite: 15 RPM, 1000 RPD)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent(userMessage);
  const response = result.response;
  return response.text() ?? "[No response text]";
}

export async function getAiReply(userMessage: string): Promise<ChatResponse> {
  await delay(MOCK_DELAY_MS);

  if (MOCK_FAIL) {
    throw new Error("Simulated API failure (NEXT_PUBLIC_MOCK_FAIL=true)");
  }

  try {
    const text = await sendToGemini(userMessage);
    return { text, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isRateLimit =
      message.includes("429") ||
      message.includes("Too Many Requests") ||
      message.includes("quota") ||
      message.includes("rate limit");
    const userMessage = isRateLimit
      ? "Rate limit reached. Please wait a minute and try again."
      : message;
    return { text: "", success: false, error: userMessage };
  }
}
