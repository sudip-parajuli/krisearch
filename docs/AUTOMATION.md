# Source updates and AI operations

## Activation

Apply `supabase/migrations/0010_automation.sql` once, after migrations 0001–0009, in the Krisearch Supabase SQL editor. It creates source/import/run tables, service-only locks and budgets, and public access only to published source items and completed AI answers. It also replaces the market-price uniqueness constraint with one including source and unit, preserving existing rows.

Set production `SUPABASE_SERVICE_ROLE_KEY`, public Supabase settings, `ADMIN_USER_IDS` and `CRON_SECRET` in Vercel. A production cron secret was configured during this implementation; keep its value private. Deploy after changing environment variables. Never put service keys or AI keys in `NEXT_PUBLIC_*` variables.

Vercel calls `/api/cron/refresh` daily at 03:15 UTC (09:00 Nepal time); on Hobby the invocation can occur anywhere in that hour. The endpoint validates its bearer secret and uses a database lease to prevent overlapping runs. Administrators can also run it from `/admin` and see per-source errors and the last five job results. A failed source does not erase the last good data.

## What refreshes

- **Prices:** official AMPIS and Kalimati tables, preserving their published Nepali-calendar date, commodity/variety and unit. Missing or invalid dates fail closed. Collection time never becomes a new price date.
- **Notices:** official Department of Agriculture links. These are source links, not invented scheme details. Collection dates are labeled separately from publication dates. Review deadlines on the original notice.
- **Weather:** Open-Meteo observations and forecasts reload while the weather page is visible, every 30 minutes. The observed timestamp is displayed.
- **Feed:** visible feed pages refresh every minute. Existing human posts remain human posts; the worker does not invent community activity.
- **Schemes, vendors and tools:** approved structured feeds support recurring updates. New entries need administrator review. Once approved, linked records update on subsequent imports. Existing manually curated records do not magically become live feeds.

## Add a trusted catalog feed

Add the provider's exact public HTTPS hostname to `AUTOMATION_ALLOWED_HOSTS` in Vercel and redeploy. Register its JSON URL and kind in `/admin`. Redirects, arbitrary off-site URLs, credentials in URLs, literal IPs and oversized responses are rejected. Only supported public fields are retained; do not supply private provider metadata.

Example feed contract (use real records and links from the approved host):

```json
{
  "items": [{
    "id": "provider-stable-id",
    "title": "Verified equipment name",
    "url": "https://approved-provider.example/tools/123",
    "summary": "Public description",
    "data": {
      "category": "irrigation",
      "last_verified": "2026-10-28",
      "how_it_helps": "A factual description from the provider",
      "purchase_price_min": 1000,
      "purchase_price_max": 1500
    }
  }]
}
```

Kinds: `notice`, `scheme`, `vendor`, `tool`. Schemes require a source `last_verified` date; optional fields are `subsidy_type`, `eligibility`, `how_to_apply`. Tools require a valid equipment category and source verification date; optional fields include `description`, `how_it_helps` and numeric nonnegative purchase prices. Vendors require an existing supported `vendor_type`; `contact_info` must be public business contact information. See `src/lib/automation/validation.ts` for accepted categories/types. Review each first import in `/admin`; reject irrelevant records. A source-check timestamp is not proof that a business is currently operating or that an offer remains open.

## AI configuration

Production Gemini was configured on 2026-10-30 with `gemini-3.5-flash-lite`. AI is disabled in any environment without a server-side provider. Set either `GEMINI_API_KEY` plus `GEMINI_MODEL`, or `OPENROUTER_API_KEY` (with optional `OPENROUTER_MODELS`). Gemini is preferred when configured; OpenRouter can be the fallback. Photo analysis currently requires OpenRouter vision support.

`/ask` supports English and Nepali questions. Eligible public feed posts can receive a separately labeled AI answer, and readers can ask follow-up questions. New posts request a reply immediately; the daily worker also checks a small recent backlog. Replies use available crop/scheme/price context and can only attach citations supplied by the server. They are general guidance, not verified diagnosis or a substitute for a local agricultural expert. Output remains subject to model error.

Requests use Supabase sessions (including guest sessions), same-origin checks, bounded input and durable database budgets: five requests per session and 30 globally per rolling 24 hours by default. `AI_DAILY_LIMIT` changes the global limit (1–500). Guest sessions are not strong identity or abuse protection; add provider-side spend limits and stronger verification before a high-traffic launch. Public question text/context is sent to the selected AI provider when AI is enabled. The form explains this; users should avoid personal information. Provider failures are shown honestly and do not block posting.

## Verification

```sh
npm test
npm run lint
npm run build
```

A webpack production build is also supported: `node node_modules/next/dist/bin/next build --webpack`. After activation, run a refresh in `/admin`, inspect each source result, verify source dates on `/prices`, and inspect `/updates`. Test `/ask` both without a provider (disabled message) and after configuring one. Do not mark the database jobs operational before migration and a successful first run.
