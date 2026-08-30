import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminUserIds } from "@/lib/supabase/admin";

/**
 * Admin-triggered market price sync. Deliberately a no-op adapter shell right
 * now: the one credible unofficial Kalimati price source we evaluated
 * (a community project's Heroku-hosted API) is dead (verified: returns
 * Heroku's "No such app" 404), and there's no official live Nepal government
 * price API. Rather than fabricate a working integration, this endpoint
 * reports that honestly. When a real source is chosen, wire it in here —
 * `SOURCE_LABEL` should describe it and rows written to `market_prices`
 * should set `source` to that same label so the UI can attribute them.
 */
const SOURCE_LABEL: string | null = null;

export async function POST() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const adminIds = getAdminUserIds();
  if (!authData.user || !adminIds.includes(authData.user.id)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  if (!SOURCE_LABEL) {
    return NextResponse.json(
      {
        synced: 0,
        message:
          "No verified live price source is wired in yet. The unofficial Kalimati API we checked is dead, and there's no official government API. Prices stay farmer-submitted (via posts) until a real source is confirmed and added to src/app/api/admin/sync-prices/route.ts.",
      },
      { status: 200 }
    );
  }

  // Real adapter goes here once SOURCE_LABEL is set — fetch, map to
  // { crop_id, market_name, price_per_unit, unit, date_recorded, source: SOURCE_LABEL },
  // and upsert into market_prices using the admin client.
  return NextResponse.json({ synced: 0, message: "Adapter not implemented." });
}
