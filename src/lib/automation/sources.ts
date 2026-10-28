import "server-only";
import * as cheerio from "cheerio";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  allowedSourceUrl,
  parseImportRecord,
  catalogPayload,
  type ImportKind,
  type ImportRecord,
} from "./validation";
import { nepalToday } from "@/lib/data-sources/market-date";

type Source = {
  id: string;
  label: string;
  kind: ImportKind;
  url: string;
  format: string;
  auto_publish: boolean;
};
const hosts = () => process.env.AUTOMATION_ALLOWED_HOSTS ?? "";
async function fetchSource(url: string) {
  if (!allowedSourceUrl(url, undefined, hosts()))
    throw new Error("Source hostname is not approved");
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
    headers: {
      "User-Agent": "KrisearchBot/1.0 (+https://krisearch.vercel.app/updates)",
    },
  });
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty source response");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2_000_000) {
      await reader.cancel();
      throw new Error("Source response is too large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
export function parseSource(text: string, source: Source): ImportRecord[] {
  if (source.format === "json") {
    const data = JSON.parse(text);
    if (!Array.isArray(data.items))
      throw new Error("JSON source must contain items[]");
    return data.items
      .slice(0, 40)
      .map((item: unknown) => parseImportRecord(item, source.url, hosts()))
      .filter((item: ImportRecord | null): item is ImportRecord => !!item);
  }
  const $ = cheerio.load(text, { xml: source.format === "rss" });
  const records: ImportRecord[] = [];
  const seen = new Set<string>();
  if (source.format === "rss") {
    $("item, entry")
      .slice(0, 20)
      .each((_, el) => {
        const title = $(el).find("title").first().text().trim();
        const link = $(el).find("link").first();
        const item = parseImportRecord(
          { title, url: link.attr("href") || link.text(), summary: "" },
          source.url,
          hosts(),
        );
        if (item && !seen.has(item.url)) {
          records.push(item);
          seen.add(item.url);
        }
      });
  } else {
    $("a[href]").each((_, el) => {
      if (records.length >= 12) return;
      const title = $(el).text().trim().replace(/\s+/g, " ");
      const href = $(el).attr("href") ?? "";
      if (title.length < 18 || !/notice|news|information|सूचना/i.test(href))
        return;
      const item = parseImportRecord({ title, url: href }, source.url, hosts());
      if (item && !seen.has(item.url)) {
        seen.add(item.url);
        records.push(item);
      }
    });
  }
  if (!records.length)
    throw new Error(
      "No eligible records found; source format may have changed",
    );
  return records;
}

export async function syncSources() {
  const admin = createAdminClient();
  if (!admin)
    return [{ source: "catalogs", error: "Database admin is not configured" }];
  const { data: sources, error } = await admin
    .from("automation_sources")
    .select("*")
    .eq("enabled", true)
    .limit(8);
  if (error)
    return [
      { source: "catalogs", error: "Automation migration is not installed" },
    ];
  return Promise.all(
    (sources as Source[]).map(async (source) => {
      const checked_at = new Date().toISOString();
      try {
        const records = parseSource(await fetchSource(source.url), source);
        let staged = 0;
        let refreshed = 0;
        for (const item of records) {
          const { data: existing, error: existingError } = await admin
            .from("automation_items")
            .select("id,state,target_id")
            .eq("source_id", source.id)
            .eq("external_key", item.external_key)
            .maybeSingle();
          if (existingError) throw new Error("Could not read import state");
          const kind =
            source.kind === "notice" &&
            /अनुदान|सहुलियत|subsid|grant|scheme|प्रस्ताव/i.test(item.title)
              ? "scheme"
              : source.kind;
          let state =
            existing?.state ??
            (source.auto_publish &&
            ["notice", "scheme"].includes(source.kind) &&
            source.format !== "json"
              ? "published"
              : "pending");
          if (existing?.state === "published" && existing.target_id) {
            const payload = catalogPayload(source.kind, item, nepalToday());
            if (payload) {
              const { error: updateError } = await admin
                .from(payload.table)
                .update(payload.data)
                .eq("id", existing.target_id);
              if (updateError)
                throw new Error("A linked catalog update failed");
              refreshed++;
            } else state = "pending";
          }
          const { error: writeError } = await admin
            .from("automation_items")
            .upsert(
              {
                source_id: source.id,
                external_key: item.external_key,
                kind,
                title: item.title,
                url: item.url,
                summary: item.summary,
                payload: item.payload,
                state,
                target_id: existing?.target_id ?? null,
                checked_at,
                published_at: state === "published" ? checked_at : null,
              },
              { onConflict: "source_id,external_key" },
            );
          if (writeError)
            throw new Error("An import record could not be saved");
          if (state === "pending") staged++;
        }
        await admin
          .from("automation_sources")
          .update({ checked_at, last_success_at: checked_at, last_error: null })
          .eq("id", source.id);
        return {
          source: source.label,
          found: records.length,
          staged,
          refreshed,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message.slice(0, 300)
            : "Import failed";
        await admin
          .from("automation_sources")
          .update({ checked_at, last_error: message })
          .eq("id", source.id);
        return { source: source.label, error: message };
      }
    }),
  );
}

export async function reviewImport(id: string, decision: "publish" | "ignore") {
  const admin = createAdminClient();
  if (!admin) throw new Error("Database admin is unavailable");
  const { data: lock } = await admin.rpc("claim_automation_lock", {
    p_key: `review:${id}`,
    p_seconds: 60,
  });
  if (!lock) throw new Error("This item is already being reviewed");
  try {
    const { data: item } = await admin
      .from("automation_items")
      .select("*")
      .eq("id", id)
      .eq("state", "pending")
      .maybeSingle();
    if (!item) throw new Error("Pending import was not found");
    let target_id = item.target_id;
    if (decision === "publish" && Object.keys(item.payload ?? {}).length) {
      const payload = catalogPayload(
        item.kind,
        { ...item, payload: item.payload },
        nepalToday(),
      );
      if (!payload)
        throw new Error("Required catalog fields are missing or invalid");
      const conflict =
        item.kind === "vendor"
          ? "business_name,vendor_type"
          : item.kind === "scheme"
            ? "title"
            : "name";
      const query = target_id
        ? admin.from(payload.table).update(payload.data).eq("id", target_id)
        : admin
            .from(payload.table)
            .upsert(payload.data, { onConflict: conflict });
      const { data, error } = await query.select("id").single();
      if (error)
        throw new Error(
          "Catalog could not be published; inspect required fields and duplicates",
        );
      target_id = String(data.id);
    }
    const { error } = await admin
      .from("automation_items")
      .update({
        state: decision === "publish" ? "published" : "ignored",
        target_id,
        published_at: decision === "publish" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) throw new Error("Review state could not be saved");
  } finally {
    await admin.from("automation_locks").delete().eq("key", `review:${id}`);
  }
}
