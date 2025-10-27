const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_PRIMARY_MODEL || "gemini-2.0-flash-001";
const FALLBACK_MODEL = process.env.NEXT_PUBLIC_FALLBACK_MODEL || "gemini-1.5-flash";

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

function getModel(modelName: string) {
  return genAI.getGenerativeModel({ model: modelName });
}

export const chatSession = getModel(PRIMARY_MODEL).startChat({
  generationConfig,
  history: [],
});

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function isRetryableError(err) {
  const message = String(err?.message || err);
  // Retry on typical transient statuses
  return /(429|500|502|503|504)/.test(message) || /fetch|network|timeout/i.test(message);
}

export async function sendWithRetry(prompt, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 750,
    timeoutMs = 30000,
    useFallback = true,
  } = options;

  async function attemptSend(modelName) {
    // Per-call timeout using AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("Request timeout")), timeoutMs);
    try {
      const session = getModel(modelName).startChat({ generationConfig, history: [] });
      const res = await session.sendMessage(prompt, { signal: controller.signal });
      const text = res?.response?.text?.() ?? "";
      if (!text) throw new Error("Empty response from model");
      return text;
    } finally {
      clearTimeout(timer);
    }
  }

  let lastErr;
  // Try primary with retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await attemptSend(PRIMARY_MODEL);
    } catch (err) {
      lastErr = err;
      if (attempt === maxRetries || !isRetryableError(err)) break;
      const jitter = Math.random() * 0.4 + 0.8; // 0.8x - 1.2x
      const delay = Math.round(baseDelayMs * Math.pow(2, attempt) * jitter);
      await sleep(delay);
    }
  }

  // Fallback model if allowed and retryable
  if (useFallback) {
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        return await attemptSend(FALLBACK_MODEL);
      } catch (err) {
        lastErr = err;
        if (!isRetryableError(err)) break;
        await sleep(baseDelayMs);
      }
    }
  }

  const friendly = new Error(
    "The AI service is temporarily overloaded. Please try again in a moment."
  );
  friendly.cause = lastErr;
  throw friendly;
}
