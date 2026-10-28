import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import vm from "node:vm";
const directory = path.dirname(fileURLToPath(import.meta.url));

// These dependency-free helpers can be exercised without a Supabase database.
function load(file) {
  const source = fs.readFileSync(path.join(directory, "..", "src", "lib", file), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("exports", code)(exports);
  return exports;
}
const { parseSaved } = load("saved.ts");
const { groupPrices, priceAge } = load("market-display.ts");
const { expandSearchTerms, normalizeSearchQuery } = load("search-synonyms.ts");
const item = { href: "/crops/rice", title: "Rice", kind: "crop", savedAt: "2026-10-28T00:00:00Z" };

test("saved resources recover safely from malformed or unavailable data", () => {
  for (const input of [null, "not json", "null", "{}", '[{"href":42}]']) assert.deepEqual(parseSaved(input), []);
});
test("saved resources reject external and script URLs and deduplicate", () => {
  const bad = ["javascript:alert(1)", "https://evil.test", "//evil.test", "/profile/private", "/post/../../admin"];
  const parsed = parseSaved(JSON.stringify([...bad.map(href => ({ ...item, href })), item, item]));
  assert.equal(parsed.length, 1); assert.equal(parsed[0].href, "/crops/rice");
});
test("saved resources keep at most 200 valid entries", () => {
  assert.equal(parseSaved(JSON.stringify(Array.from({ length: 210 }, (_, i) => ({ ...item, href: `/crops/crop-${i}` })))).length, 200);
});
test("price comparisons keep units separate and sort newest first", () => {
  const quote = { crop_id: 1, market_name: "Kalimati", unit: "kg", price_per_unit: 40 };
  const grouped = groupPrices([{ ...quote, date_recorded: "2026-10-25" }, { ...quote, date_recorded: "2026-10-28" }, { ...quote, unit: "quintal", date_recorded: "2026-10-28" }]);
  assert.equal(grouped.size, 2); assert.equal([...grouped.values()][0][0].date_recorded, "2026-10-28");
});
test("price freshness handles Nepal time, old data, missing and invalid dates", () => {
  const now = new Date("2026-10-28T12:00:00+05:45");
  assert.equal(priceAge("2026-10-28", now), "recent");
  assert.equal(priceAge("2026-10-24", now), "old");
  for (const date of [null, "2026-10-29", "2026-02-31", "no date"]) assert.equal(priceAge(date, now), "unknown");
});
test("crop aliases match English, Nepali and Romanized Nepali", () => {
  assert.ok(expandSearchTerms("makai").includes("maize"));
  assert.ok(expandSearchTerms("मकै").includes("maize"));
  assert.ok(expandSearchTerms(" Corn ").includes("मकै"));
});
test("search input cannot introduce PostgREST filter syntax", () => {
  assert.equal(normalizeSearchQuery('rice),title.eq.secret%_'), 'rice title eq secret');
  assert.equal(normalizeSearchQuery('  मकै  '), 'मकै');
  assert.equal(normalizeSearchQuery('x'.repeat(300)).length, 200);
});

function workerHarness(fetchImpl = async () => new Response("network")) {
  const listeners = {}; const writes = []; const deleted = [];
  const context = { URL, Response, fetch: fetchImpl,
    self: { location: { origin: "https://krisearch.test" }, addEventListener: (name, fn) => { listeners[name] = fn; }, clients: { claim: async () => {} } },
    caches: { match: async () => new Response("generic offline"), keys: async () => ["krisearch-v1", "krisearch-v2", "other-app-cache"], delete: async key => { deleted.push(key); }, open: async () => ({ put: async (...args) => writes.push(args) }) },
  };
  vm.runInNewContext(fs.readFileSync(path.join(directory, "..", "public", "sw.js"), "utf8"), context);
  function request(pathname, mode = "cors", headers = new Headers()) {
    let response;
    listeners.fetch({ request: { method: "GET", url: `https://krisearch.test${pathname}`, mode, headers }, respondWith: p => { response = p; }, waitUntil: () => {} });
    return response;
  }
  return { listeners, request, writes, deleted };
}
test("offline worker does not cache private navigations or intercept API/RSC", async () => {
  const worker = workerHarness();
  assert.equal(worker.request("/api/ai/check"), undefined);
  assert.equal(worker.request("/feed", "cors", new Headers({ RSC: "1" })), undefined);
  const response = await worker.request("/profile/private", "navigate");
  assert.equal(await response.text(), "network");
  assert.equal(worker.writes.length, 0);
});
test("offline fallback is generic and cache retirement leaves other apps alone", async () => {
  const worker = workerHarness(async () => { throw new Error("offline"); });
  assert.equal(await (await worker.request("/prices", "navigate")).text(), "generic offline");
  let completion;
  worker.listeners.activate({ waitUntil: promise => { completion = promise; } });
  await completion;
  assert.deepEqual(worker.deleted, ["krisearch-v1"]);
});
