/**
 * Unit tests for Gemini AI reply (data layer).
 * Covers mock response when no API key and simulated failure handling.
 */

describe("getAiReply", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns mock response when GEMINI_API_KEY is not set", async () => {
    process.env.GEMINI_API_KEY = "";
    process.env.NEXT_PUBLIC_MOCK_DELAY_MS = "0";
    process.env.NEXT_PUBLIC_MOCK_FAIL = "";

    const { getAiReply } = require("@/lib/api/gemini");
    const result = await getAiReply("hello");

    expect(result.success).toBe(true);
    expect(result.text).toContain("[Mock]");
    expect(result.text).toContain("GEMINI_API_KEY");
  });

  it("throws when NEXT_PUBLIC_MOCK_FAIL is true", async () => {
    process.env.GEMINI_API_KEY = "";
    process.env.NEXT_PUBLIC_MOCK_DELAY_MS = "0";
    process.env.NEXT_PUBLIC_MOCK_FAIL = "true";

    const { getAiReply } = require("@/lib/api/gemini");

    await expect(getAiReply("hello")).rejects.toThrow(
      "Simulated API failure"
    );
  });

  it("returns friendly message on rate-limit (429) error", async () => {
    process.env.GEMINI_API_KEY = "key";
    process.env.NEXT_PUBLIC_MOCK_DELAY_MS = "0";
    process.env.NEXT_PUBLIC_MOCK_FAIL = "";

    jest.mock("@google/generative-ai", () => ({
      GoogleGenerativeAI: class {
        getGenerativeModel = () => ({
          generateContent: () =>
            Promise.reject(
              new Error("429 Too Many Requests - quota exceeded")
            ),
        });
      },
    }));

    const { getAiReply } = require("@/lib/api/gemini");
    const result = await getAiReply("hello");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Rate limit reached");
  });
});
