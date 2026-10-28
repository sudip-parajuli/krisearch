export type ImportKind = "notice" | "scheme" | "vendor" | "tool";
export type ImportRecord = {
  external_key: string;
  title: string;
  url: string;
  summary: string;
  payload: Record<string, unknown>;
};
export function allowedSourceUrl(
  input: string,
  sourceUrl?: string,
  extraHosts = "",
): string | null {
  try {
    const url = new URL(input, sourceUrl);
    if (
      url.hostname === "localhost" ||
      /(?:\.local|\.localhost|\.internal)$/.test(url.hostname) ||
      /^[\d.]+$/.test(url.hostname) ||
      url.hostname.includes(":")
    )
      return null;
    const hosts = new Set([
      "doanepal.gov.np",
      "moald.gov.np",
      "ampis.gov.np",
      "kalimatimarket.gov.np",
      ...extraHosts
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean),
    ]);
    if (sourceUrl) {
      const source = new URL(sourceUrl);
      if (!hosts.has(source.hostname)) return null;
      if (url.hostname !== source.hostname) return null;
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !hosts.has(url.hostname)
    )
      return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
export function parseImportRecord(
  raw: unknown,
  source: string,
  extraHosts = "",
): ImportRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (
    typeof record.title !== "string" ||
    record.title.trim().length < 5 ||
    typeof record.url !== "string"
  )
    return null;
  const url = allowedSourceUrl(record.url, source, extraHosts);
  if (!url) return null;
  const originalPayload =
    record.data &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
      ? (record.data as Record<string, unknown>)
      : {};
  const publicFields = new Set([
    "last_verified",
    "description",
    "subsidy_type",
    "eligibility",
    "how_to_apply",
    "vendor_type",
    "contact_info",
    "category",
    "how_it_helps",
    "purchase_price_min",
    "purchase_price_max",
  ]);
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(originalPayload)) {
    if (!publicFields.has(key)) continue;
    if (typeof value === "string") payload[key] = value.slice(0, 2000);
    else if (typeof value === "number" && Number.isFinite(value))
      payload[key] = value;
  }
  return {
    external_key: String(record.id ?? url).slice(0, 300),
    title: record.title.trim().slice(0, 250),
    url,
    summary:
      typeof record.summary === "string" ? record.summary.slice(0, 500) : "",
    payload,
  };
}
export function catalogPayload(
  kind: ImportKind,
  item: ImportRecord,
  today: string,
): { table: string; data: Record<string, unknown> } | null {
  const d = item.payload;
  const text = (key: string, max = 2000) =>
    typeof d[key] === "string" ? (d[key] as string).slice(0, max) : null;
  const number = (key: string) =>
    typeof d[key] === "number" &&
    Number.isFinite(d[key]) &&
    (d[key] as number) >= 0
      ? d[key]
      : null;
  const verified =
    typeof d.last_verified === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(d.last_verified) &&
    Number.isFinite(Date.parse(d.last_verified)) &&
    d.last_verified <= today
      ? d.last_verified
      : null;
  if (kind === "scheme" && verified)
    return {
      table: "schemes",
      data: {
        title: item.title,
        description: item.summary || text("description"),
        subsidy_type: text("subsidy_type"),
        eligibility: text("eligibility"),
        how_to_apply: text("how_to_apply"),
        source_url: item.url,
        last_verified: verified,
      },
    };
  if (
    kind === "vendor" &&
    [
      "crop_buyer",
      "equipment_supplier",
      "input_supplier",
      "drone_service",
    ].includes(String(d.vendor_type))
  )
    return {
      table: "vendors",
      data: {
        business_name: item.title,
        vendor_type: d.vendor_type,
        contact_info: text("contact_info", 500),
      },
    };
  if (
    kind === "tool" &&
    verified &&
    [
      "drone",
      "iot_sensor",
      "irrigation",
      "machinery",
      "greenhouse",
      "solar",
      "post_harvest",
      "digital_app",
    ].includes(String(d.category))
  )
    return {
      table: "equipment",
      data: {
        name: item.title,
        category: d.category,
        description: item.summary || text("description"),
        how_it_helps: text("how_it_helps"),
        source_url: item.url,
        last_verified: verified,
        purchase_price_min: number("purchase_price_min"),
        purchase_price_max: number("purchase_price_max"),
        scope: "nepal",
      },
    };
  return null;
}
