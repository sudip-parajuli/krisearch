import "server-only";

/**
 * Labels a farming remedy/answer as safe / caution / danger / unverified,
 * using OpenRouter (https://openrouter.ai) so the app isn't tied to one paid
 * provider — OPENROUTER_MODELS is an ordered list and OpenRouter itself
 * retries the next model if one is rate-limited or unavailable, all within
 * one request. Free-tier model slugs on OpenRouter churn over time; check
 * https://openrouter.ai/models?max_price=0 periodically and update
 * OPENROUTER_MODELS if the defaults stop working.
 *
 * Fails soft everywhere: no API key, a network error, or a malformed model
 * response all resolve to `verdict: null` (meaning "not checked") rather
 * than throwing — a missing safety label should never break posting.
 */

export type FactCheckResult = {
  verdict: "safe" | "caution" | "danger" | "unverified";
  rationale: string;
} | null;

const DEFAULT_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "minimax/minimax-m3:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

function getModels(): string[] {
  const configured = process.env.OPENROUTER_MODELS?.split(",").map((m) => m.trim()).filter(Boolean);
  return configured && configured.length > 0 ? configured : DEFAULT_MODELS;
}

const SYSTEM_PROMPT = `You are a cautious agricultural safety reviewer for Nepali smallholder farmers. \
You will be shown a farming question/context and one community-submitted answer (a remedy, \
fertilizer suggestion, pesticide use, or similar advice). Judge ONLY the safety and plausibility \
of the answer, not writing quality.

Respond with ONLY a JSON object, no other text:
{"verdict": "safe" | "caution" | "danger" | "unverified", "rationale": "<one short sentence, max 25 words>"}

- "safe": a plausible, low-risk agricultural practice (e.g. common organic remedies, standard dosages).
- "caution": plausible but has real risk if misapplied (e.g. correct chemical but dosage/timing needs care).
- "danger": likely harmful, unsafe, or could damage crops/soil/health/livestock if followed as written.
- "unverified": you cannot judge this confidently either way (too vague, outside your knowledge, or not actually agricultural advice).
When unsure, prefer "unverified" or "caution" over "safe" — do not guess.`;

export async function classifyRemedy(context: {
  postTitle: string;
  postBody: string;
  answerBody: string;
}): Promise<FactCheckResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const userPrompt = `Question/context:\nTitle: ${context.postTitle}\n${context.postBody}\n\nCommunity answer to judge:\n${context.answerBody}`;

  try {
    const models = getModels();
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
        temperature: 0,
        max_tokens: 150,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
      // Keep this from hanging the comment/post flow indefinitely.
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw: string | undefined = data?.choices?.[0]?.message?.content;
    if (!raw) return null;

    return parseVerdict(raw);
  } catch {
    return null; // network error, timeout, etc. — no signal, not a crash
  }
}

function parseVerdict(raw: string): FactCheckResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const verdict = String(parsed.verdict ?? "").toLowerCase();
    if (verdict === "safe" || verdict === "caution" || verdict === "danger" || verdict === "unverified") {
      return { verdict, rationale: String(parsed.rationale ?? "").slice(0, 300) };
    }
    return null;
  } catch {
    return null;
  }
}
