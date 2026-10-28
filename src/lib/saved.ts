export type SavedItem = { href: string; title: string; kind: "crop" | "post"; savedAt: string };
export const SAVED_KEY = "krisearch-saved-v1";
export function parseSaved(raw: string | null): SavedItem[] {
  try {
    const data: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    return data.filter((item): item is SavedItem => {
      if (!item || typeof item !== "object") return false;
      const v = item as SavedItem;
      if (typeof v.href !== "string" || !/^\/(crops|post)\/[a-zA-Z0-9-]+$/.test(v.href) || typeof v.title !== "string" || v.title.length > 300 || !["crop", "post"].includes(v.kind) || typeof v.savedAt !== "string" || !Number.isFinite(Date.parse(v.savedAt)) || seen.has(v.href)) return false;
      seen.add(v.href); return true;
    }).slice(0, 200);
  } catch { return []; }
}
