import "server-only";

/**
 * Shared OpenRouter chat-completion caller — used by both the safety
 * classifier (factcheck.ts) and the search-overview generator. See
 * factcheck.ts's file comment for why OpenRouter (free-tier, multi-model
 * fallback) instead of a paid provider.
 */

const DEFAULT_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "minimax/minimax-m3:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

export function getOpenRouterModels(): string[] {
  const configured = process.env.OPENROUTER_MODELS?.split(",").map((m) => m.trim()).filter(Boolean);
  return configured && configured.length > 0 ? configured : DEFAULT_MODELS;
}

export function hasOpenRouterKey(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

/** Returns the raw assistant text, or null on any failure (no key, network error, non-200). */
export async function callOpenRouter(
  messages: { role: "system" | "user"; content: string }[],
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {}
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const models = getOpenRouterModels();
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
