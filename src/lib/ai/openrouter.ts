import "server-only";

/**
 * Shared OpenRouter chat-completion caller — used by the safety classifier
 * (factcheck.ts), the search-overview generator, and photo diagnosis. See
 * factcheck.ts's file comment for why OpenRouter (free-tier, multi-model
 * fallback) instead of a paid provider.
 */

const DEFAULT_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "minimax/minimax-m3:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

// minimax/minimax-m3:free is, as of writing, the one confirmed-free
// OpenRouter model that accepts image input — put first so vision calls
// don't waste a round trip on a text-only model that'll ignore the image.
const DEFAULT_VISION_MODELS = ["minimax/minimax-m3:free"];

export function getOpenRouterModels(): string[] {
  const configured = process.env.OPENROUTER_MODELS?.split(",").map((m) => m.trim()).filter(Boolean);
  return configured && configured.length > 0 ? configured : DEFAULT_MODELS;
}

function getVisionModels(): string[] {
  const configured = process.env.OPENROUTER_VISION_MODELS?.split(",").map((m) => m.trim()).filter(Boolean);
  return configured && configured.length > 0 ? configured : DEFAULT_VISION_MODELS;
}

export function hasOpenRouterKey(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}
export function hasTextAI(): boolean { return Boolean(process.env.OPENROUTER_API_KEY || (process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL)); }

type TextContent = { type: "text"; text: string };
type ImageContent = { type: "image_url"; image_url: { url: string } };
type MessageContent = string | (TextContent | ImageContent)[];

/** Returns the raw assistant text, or null on any failure (no key, network error, non-200). */
export async function callOpenRouter(
  messages: { role: "system" | "user"; content: MessageContent }[],
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number; vision?: boolean } = {}
): Promise<string | null> {
  if (!opts.vision && process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL) {
    try {
      const model = process.env.GEMINI_MODEL;
      if (!/^[a-zA-Z0-9._-]+$/.test(model)) return null;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST", signal: AbortSignal.timeout(opts.timeoutMs ?? 20_000),
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({ systemInstruction: { parts: messages.filter(m => m.role === "system").map(m => ({ text: typeof m.content === "string" ? m.content : "" })) }, contents: messages.filter(m => m.role === "user").map(m => ({ role: "user", parts: [{ text: typeof m.content === "string" ? m.content : "" }] })), generationConfig: { maxOutputTokens: opts.maxTokens ?? 500, temperature: opts.temperature ?? 0 } }),
      });
      if (res.ok) { const data = await res.json(); const text = data.candidates?.[0]?.content?.parts?.filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought).map((p: { text: string }) => p.text).join("\n"); if (text) return text; }
    } catch { /* Optional OpenRouter fallback follows. */ }
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const models = opts.vision ? getVisionModels() : getOpenRouterModels();
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://krisearch.app",
        "X-Title": "Krisearch",
      },
      body: JSON.stringify({
        model: models[0],
        models, // OpenRouter tries the next model in this list on failure/rate-limit
        temperature: opts.temperature ?? 0,
        max_tokens: opts.maxTokens ?? 150,
        messages,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 20_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
