export type Citation = { id: string; label: string; href: string };
export type BotAnswer = {
  answer: string;
  citations: Citation[];
  needsExpert: boolean;
};
export function parseAIAnswer(
  raw: string,
  citations: Citation[],
): BotAnswer | null {
  try {
    const parsed = JSON.parse(
      raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""),
    );
    if (
      !parsed ||
      typeof parsed.answer !== "string" ||
      parsed.answer.trim().length < 10
    )
      return null;
    const ids = Array.isArray(parsed.sources)
      ? parsed.sources.filter((id: unknown) => typeof id === "string")
      : [];
    return {
      answer: parsed.answer.trim().slice(0, 4000),
      citations: citations.filter((c) => ids.includes(c.id)).slice(0, 5),
      needsExpert: parsed.needsExpert !== false,
    };
  } catch {
    return null;
  }
}
