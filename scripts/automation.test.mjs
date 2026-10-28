import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const require = createRequire(import.meta.url);
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/lib",
);
function load(file) {
  const filename = path.join(root, file);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  new Function("exports", "require", code)(exports, (id) => {
    if (id === "server-only") return {};
    if (id === "@/lib/supabase/admin") return { createAdminClient: () => null };
    if (id.startsWith("@/lib/")) return load(`${id.slice(6)}.ts`);
    if (id.startsWith("."))
      return load(
        path.relative(root, path.resolve(path.dirname(filename), `${id}.ts`)),
      );
    return require(id);
  });
  return exports;
}
const { parseMarketDate, nepalToday } = load("data-sources/market-date.ts");
const { allowedSourceUrl, parseImportRecord, catalogPayload } = load(
  "automation/validation.ts",
);
const { parseSource } = load("automation/sources.ts");
const { matchCropForCommodity } = load("data-sources/crop-mapping.ts");

test("published BS market dates convert correctly without relabeling today's fetch", () => {
  assert.equal(parseMarketDate("मिति: कार्तिक 11, 2083"), "2026-10-28");
  assert.equal(parseMarketDate("वि.सं. कार्तिक ११, २०८३"), "2026-10-28");
  assert.equal(parseMarketDate("no published date"), null);
  assert.equal(parseMarketDate("कार्तिक 55, 2083"), null);
  assert.equal(nepalToday(new Date("2026-10-27T19:00:00Z")), "2026-10-28");
});
test("only approved public HTTPS source URLs are accepted", () => {
  for (const url of [
    "http://doanepal.gov.np/",
    "https://evil.example/",
    "https://user:password@doanepal.gov.np/",
    "https://127.0.0.1/",
    "https://localhost/",
    "https://doanepal.gov.np:8443/",
  ])
    assert.equal(allowedSourceUrl(url), null);
  assert.equal(
    allowedSourceUrl("/ne/notices/12", "https://doanepal.gov.np/ne/"),
    "https://doanepal.gov.np/ne/notices/12",
  );
  assert.equal(
    allowedSourceUrl("https://moald.gov.np/", "https://doanepal.gov.np/ne/"),
    null,
  );
});
test("catalogs need structured fields and retain the source verification date", () => {
  const item = parseImportRecord(
    {
      id: "1",
      title: "A real source announcement",
      url: "https://doanepal.gov.np/ne/notice/1",
      data: { last_verified: "2026-10-01" },
    },
    "https://doanepal.gov.np/ne/",
  );
  assert.ok(item);
  assert.equal(
    catalogPayload("scheme", item, "2026-10-28").data.last_verified,
    "2026-10-01",
  );
  assert.equal(catalogPayload("tool", item, "2026-10-28"), null);
  assert.equal(catalogPayload("vendor", item, "2026-10-28"), null);
  assert.equal(
    catalogPayload("scheme", { ...item, payload: {} }, "2026-10-28"),
    null,
  );
});
test("notice discovery deduplicates links and ignores off-site targets", () => {
  const source = {
    id: "doa",
    kind: "notice",
    url: "https://doanepal.gov.np/ne/",
    format: "html_links",
  };
  const records = parseSource(
    '<a href="/ne/notice/1">A genuine agricultural notice headline</a><a href="/ne/notice/1">A duplicate agricultural notice headline</a><a href="https://evil.example/news/2">An off-site article that is unapproved</a>',
    source,
  );
  assert.equal(records.length, 1);
  assert.equal(records[0].url, "https://doanepal.gov.np/ne/notice/1");
});
test("JSON feeds do not accept malformed items or unapproved URLs", () => {
  const source = {
    id: "doa",
    kind: "tool",
    url: "https://doanepal.gov.np/tools.json",
    format: "json",
  };
  const records = parseSource(
    JSON.stringify({
      items: [
        null,
        { title: "Wrong URL", url: "javascript:alert(1)" },
        {
          title: "Approved tool reference",
          url: "https://doanepal.gov.np/tool/1",
          data: { category: "irrigation", last_verified: "2026-10-01" },
        },
      ],
    }),
    source,
  );
  assert.equal(records.length, 1);
  assert.ok(catalogPayload("tool", records[0], "2026-10-28"));
});
test("generic oyster mushrooms are not imported as button mushrooms", () => {
  assert.equal(matchCropForCommodity("च्याउ(कन्य)"), null);
  assert.equal(matchCropForCommodity("च्याउ(बटन)"), "Mushroom (Button)");
  assert.equal(matchCropForCommodity("गाँजर (लोकल)"), "Carrot");
});
test("price adapters preserve publication date and normalized unit", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        '<p class="market-date">मिति: कार्तिक 11, 2083</p><table><tbody><tr><td>गोलभेंडा ठुलो</td><td>के.जी.</td><td>40</td><td>50</td><td>45</td></tr></tbody></table>',
      );
    const rows = await load("data-sources/ampis.ts").fetchAmpisPrices();
    assert.equal(rows[0].dateRecorded, "2026-10-28");
    assert.equal(rows[0].unit, "per kg");
    assert.equal(rows[0].avg, 45);
    globalThis.fetch = async () =>
      new Response("<table><tbody><tr><td>no date</td></tr></tbody></table>");
    await assert.rejects(
      load("data-sources/ampis.ts").fetchAmpisPrices(),
      /date/,
    );
  } finally {
    globalThis.fetch = original;
  }
});

const { parseAIAnswer } = load("ai/answer-format.ts");
test("AI output only cites supplied sources and rejects malformed answers", () => {
  const citations = [{ id: "crop-1", label: "Rice", href: "/crops/rice" }];
  const result = parseAIAnswer(
    JSON.stringify({
      answer: "Check the crop reference and consult a local expert.",
      sources: ["crop-1", "invented"],
      needsExpert: false,
    }),
    citations,
  );
  assert.deepEqual(result.citations, citations);
  assert.equal(result.needsExpert, false);
  assert.equal(parseAIAnswer("not JSON", citations), null);
  assert.equal(parseAIAnswer("null", citations), null);
  assert.equal(parseAIAnswer('{"answer":"short"}', citations), null);
  assert.equal(
    parseAIAnswer(
      JSON.stringify({ answer: "A sufficiently long answer." }),
      citations,
    ).needsExpert,
    true,
  );
});
test("import records discard unknown provider metadata", () => {
  const item = parseImportRecord(
    {
      title: "Approved source entry",
      url: "https://doanepal.gov.np/notice/1",
      data: {
        category: "irrigation",
        internal_notes: "private",
        token: "secret",
        description: "Public description",
      },
    },
    "https://doanepal.gov.np/",
  );
  assert.deepEqual(item.payload, {
    category: "irrigation",
    description: "Public description",
  });
});
