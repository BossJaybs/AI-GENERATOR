import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_PRIMARY_MODEL || "gemini-2.0-flash-001";
const FALLBACK_MODEL = process.env.NEXT_PUBLIC_FALLBACK_MODEL || "gpt-3.5-turbo";

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

function getModel(modelName: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  console.log('AiModel: NEXT_PUBLIC_GEMINI_API_KEY is set:', !!apiKey);
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function isRetryableError(err: any) {
  const message = String(err?.message || err);
  // Retry on typical transient statuses
  return /(429|500|502|503|504)/.test(message) || /fetch|network|timeout/i.test(message);
}

export async function sendWithRetry(prompt: string, options: { maxRetries?: number; baseDelayMs?: number; timeoutMs?: number; useFallback?: boolean } = {}) {
  const {
    maxRetries = 2,
    baseDelayMs = 1000,
    timeoutMs = 5000,
    useFallback = true,
  } = options;

  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  async function attemptSend(modelName: string) {
    // Per-call timeout using AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("Request timeout")), timeoutMs);
    try {
      if (modelName.startsWith('gpt-')) {
        // OpenAI
        const apiKey = process.env.OPENAI_API_KEY;
        console.log('AiModel: OPENAI_API_KEY is set:', !!apiKey);
        if (!apiKey) {
          throw new Error("OPENAI_API_KEY is not set");
        }
        const openai = new OpenAI({ apiKey });
        const res = await openai.chat.completions.create({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 8192,
        }, { signal: controller.signal });
        const text = res.choices[0]?.message?.content ?? "";
        if (!text) throw new Error("Empty response from model");
        return text;
      } else {
        // Gemini
        const session = getModel(modelName).startChat({ generationConfig, history: [] });
        const res = await session.sendMessage(prompt);
        const text = res?.response?.text?.() ?? "";
        if (!text) throw new Error("Empty response from model");
        return text;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  let lastErr: any;
  const fallbackMaxRetries = 1;
  // Try primary with retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await attemptSend(PRIMARY_MODEL);
    } catch (err) {
      lastErr = err;
      console.log(`Retry attempt ${attempt + 1} failed:`, err);
      if (attempt === maxRetries || !isRetryableError(err)) break;
      const jitter = Math.random() * 0.4 + 0.8; // 0.8x - 1.2x
      const delay = Math.round(baseDelayMs * Math.pow(2, attempt) * jitter);
      await sleep(delay);
    }
  }

  // Fallback model if allowed and retryable
  if (useFallback) {
    for (let attempt = 0; attempt <= fallbackMaxRetries; attempt++) {
      try {
        return await attemptSend(FALLBACK_MODEL);
      } catch (err) {
        lastErr = err;
        if (attempt === fallbackMaxRetries || !isRetryableError(err)) break;
        console.log(`Fallback retry attempt ${attempt + 1} failed:`, err);
        await sleep(baseDelayMs);
      }
    }
  }

  const isRateLimit = String(lastErr?.message || lastErr).includes('429');
  const isQuotaExceeded = String(lastErr?.message || lastErr).toLowerCase().includes('quota');
  const friendly = new Error(
    isQuotaExceeded
      ? "Quota exceeded. Please check your AI provider billing and try again."
      : isRateLimit
      ? "Rate limit exceeded. Please try again later."
      : "The AI service is temporarily overloaded. Please try again in a moment."
  );
  friendly.cause = lastErr;
  throw friendly;
}
