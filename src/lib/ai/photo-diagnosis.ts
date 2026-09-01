import "server-only";
import { callOpenRouter } from "./openrouter";

/**
 * A first-pass, non-authoritative read on a pest/disease photo — using
 * minimax/minimax-m3:free on OpenRouter, the one confirmed-free vision-
 * capable model at time of writing (see openrouter.ts). This is explicitly
 * framed to the model (and the UI) as a starting point for a human/
 * community answer, never a diagnosis to act on alone — the same honesty
 * framing as everything else AI-generated on this platform.
 */

export type PhotoDiagnosis = { summary: string } | null;

const SYSTEM_PROMPT = `You are an agricultural assistant helping a Nepali smallholder farmer with a crop photo. \
You will see a photo (a leaf, plant, or crop) plus optional text context. Give a brief, honest first impression — \
what you can actually see, and 1-2 plausible explanations if it looks like a disease/pest/nutrient issue. \
Explicitly say if the photo is unclear, ambiguous, or you're not confident. Do not give a definitive diagnosis — \
this is a starting point for a community discussion, not a replacement for it. Keep the whole response to 3-4 \
short sentences, plain text, no markdown, no lists.`;

export async function diagnosePhoto(context: { imageUrl: string; title: string; body: string }): Promise<PhotoDiagnosis> {
  const raw = await callOpenRouter(
    [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: `Context from the farmer:\nTitle: ${context.title}\n${context.body}`.trim() },
          { type: "image_url", image_url: { url: context.imageUrl } },
        ],
      },
    ],
    { maxTokens: 250, temperature: 0.2, timeoutMs: 30_000, vision: true }
  );
  if (!raw) return null;
  return { summary: raw.trim().slice(0, 800) };
}
