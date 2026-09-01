# Krisearch (कृषिSearch)

A community-driven agriculture platform for Nepali farmers: a thin, curated
**facts layer** (zones, crops, government schemes, market prices, modern
tools) sits above the real product — a **community layer** where farmers
post crop issues, pest/disease reports, fertilizer tips, dealer experiences,
and local prices, Reddit-style (posts, tags, comments, upvotes).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres, Auth, Storage)
- Deploy target: Vercel

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project details
npm run dev
```

The app **runs without a configured Supabase project** — every data page
shows an "Supabase isn't connected yet" notice and an empty state instead of
crashing, so you can review layout/UI before wiring up a backend.

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then copy into
`.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — same page (**server-only, never expose to the browser**).
  Used exclusively by `/admin` moderation actions (see
  [src/lib/supabase/admin.ts](src/lib/supabase/admin.ts)).

### 2. Run the migrations

In the Supabase SQL Editor (or via the Supabase CLI: `supabase db push`),
run the files in [supabase/migrations/](supabase/migrations/) **in order**:

1. `0001_schema.sql` — facts layer + community layer tables
2. `0002_rls.sql` — Row Level Security policies
3. `0003_storage.sql` — the `post-images` storage bucket + upload policies
4. `0004_guest_ai_feedback.sql` — guest-posting columns, AI verdict columns
   (+ the trigger that stops users forging their own "safe" verdict),
   best-answer marking, the `feedback` table, and the tools directory's
   `scope` (nepal/global) column
5. `0005_content_and_richer_tools.sql` — real unique constraints on every
   facts-layer table's natural key (fixes a bug: `seed.sql` previously used
   `on conflict do nothing` with no real target, so re-running it would have
   silently duplicated every zone/district/crop/equipment row), plus
   `equipment.name_np` (Nepali name) and `equipment.video_url`
6. `0006_avatars_and_verification.sql` — `profiles.avatar_url` +
   `profiles.verification_method` (see "Feed authenticity" below), and the
   same unique-constraint fix for `schemes.title`. **Until this runs, the
   feed/homepage will show empty** — `getPosts()`'s join now selects
   `avatar_url`/`verification_method` from `profiles`, and Postgres errors
   the whole query on an unknown column; the app's fail-soft design turns
   that into an empty state rather than a crash, but it does mean no posts
   show until you run this one. Run it before anything else in this list if
   you're catching up.

Then load [supabase/seed.sql](supabase/seed.sql) — safe to re-run any time
now that `0005`/`0006` give it real upsert targets, and it now includes a
one-time cleanup of any earlier fictional schemes/vendors. It has zones,
districts, ~24 crops, Nepal + global-tech equipment (with real source/video
links checked live while writing it), **real, sourced government schemes**
and **real vendor organizations** (see "Real data, honestly scoped" below),
and a mix of placeholder + real dated market-price snapshots. **Still not a
verified production dataset end to end** — re-check scheme details
periodically; things change.

### Demo content (optional, for a non-empty first impression)

An empty platform doesn't tell a new visitor anything, so
[scripts/seed-demo.mjs](scripts/seed-demo.mjs) creates ~10 realistic Nepali
farmer accounts (via the Supabase Admin API, not a raw `auth.users` insert)
and ~18 posts / ~10 comments / dozens of votes across every post type and
several districts/crops — written in Nepali, the way farmers here would
actually write. Run it after migrations `0001`–`0004` (it doesn't need
`0005`):

```bash
node scripts/seed-demo.mjs      # idempotent — safe to re-run
node scripts/remove-demo.mjs    # removes everything it created
```

Every demo account uses an `@demo.krisearch.local` email so it's always
identifiable and fully removable later; they're not meant to be real,
usable logins.

### 3. Enable anonymous sign-ins (guest posting)

Anyone can browse without an account already. To let people **post, comment,
vote, or report without any login screen at all** — a real anonymous
Supabase session is created silently the first time they try — turn on
**Authentication → Settings → "Allow anonymous sign-ins"** in your Supabase
project. This can't be set via SQL/migration; it's a project-level auth
toggle. Without it, guest actions fail with an error asking the visitor to
try the phone/email/Google/Facebook login instead. Feedback (the floating
💬 button) doesn't need this at all — it's insertable by literally anyone,
no session of any kind.

### 4. Enable phone auth (primary sign-in) + OAuth (optional)

Krisearch defaults to phone-number sign-in, since many farmers don't check
email regularly. The [/login](src/app/login/page.tsx) page offers phone,
email, Google, and Facebook as equal options:

- **Phone**: Supabase Dashboard → **Authentication → Providers → Phone**,
  and configure an SMS provider (Twilio, MessageBird, etc.) with your API
  credentials. Without this, phone OTP requests fail with the provider's
  error message shown on the page.
- **Google**: [Google Cloud Console](https://console.cloud.google.com) →
  APIs & Services → Credentials → **Create OAuth client ID** (Web
  application). Authorized redirect URI:
  `https://mejwhwltkoscdbyrmnmi.supabase.co/auth/v1/callback`. Paste the
  resulting Client ID/Secret into Supabase → **Authentication → Providers →
  Google** and enable it.
- **Facebook**: [Meta for Developers](https://developers.facebook.com) →
  Create App → add the **Facebook Login** product → Settings → Valid OAuth
  Redirect URI: the same Supabase callback URL as above. Paste the App
  ID/Secret into Supabase → **Authentication → Providers → Facebook**.

Both OAuth providers redirect back through
[src/app/auth/callback/route.ts](src/app/auth/callback/route.ts), which
exchanges the code for a session and creates the `profiles` row.

A visitor who started as a guest (anonymous session) and then verifies a
real phone/email on `/login` gets **identity-linked**, not a second account
— see the "Design notes" section below.

### 5. AI safety signal (optional)

Community answers to pest/disease/fertilizer questions get a
safe/caution/danger/unverified badge from an LLM classifier — see
[src/lib/ai/factcheck.ts](src/lib/ai/factcheck.ts). It runs on
[OpenRouter](https://openrouter.ai), not a paid Anthropic key: get a free
key at [openrouter.ai/keys](https://openrouter.ai/keys) (no card required
for free-tier models) and set `OPENROUTER_API_KEY` in `.env.local`.
`OPENROUTER_MODELS` is an ordered fallback list — OpenRouter itself retries
the next model in one request if one is rate-limited or pulled. Free-tier
model slugs change over time; refresh the list from
[openrouter.ai/models?max_price=0](https://openrouter.ai/models?max_price=0)
if the defaults stop working. Leaving the key unset just leaves badges off
— nothing else breaks.

### 6. Set up admin access

Add the Supabase Auth user UUID(s) (Authentication → Users) of your admin
account(s) to `ADMIN_USER_IDS` in `.env.local` (comma-separated) to unlock
[/admin](src/app/admin/page.tsx) — market-price sync trigger, the feedback
inbox, reviewing reported content, and granting/revoking `verified_badge`.

### 7. Market price auto-sync — real, working, against two official sources

`/admin`'s "Sync real government prices now" button and
[src/app/api/admin/sync-prices/route.ts](src/app/api/admin/sync-prices/route.ts)
scrape **today's** wholesale price table from two official Nepal government
sites — no API exists for either, but both server-render a real HTML price
table (verified live 2026-09-01), so this is a real scraper, not a
fabricated integration:

- **AMPIS** (ampis.gov.np) — the Department of Agriculture / Ministry of
  Agriculture, Forests and Environment's own price system.
- **Kalimati Fruits & Vegetable Market Development Board**
  (kalimatimarket.gov.np) — the government body regulating Nepal's largest
  wholesale market since 1995.

See [src/lib/data-sources/](src/lib/data-sources/) for the parsers and the
Nepali-commodity-name → crop mapping (deliberately scoped to what these
sites actually list — vegetables/fruits, not grains or livestock). Every
synced price row's `source` field names the exact matched commodity variety
(e.g. "AMPIS — गोलभेंडा ठुलो (नेपाली)"), so nothing is hidden about which
specific variety produced the number. **Runs automatically once a day** via
Vercel Cron (see `vercel.json`) once you set `CRON_SECRET` — generate any
long random string (`openssl rand -hex 32`) and set it as **both** a Vercel
project environment variable and in your local `.env.local`; they must
match. Without `CRON_SECRET` set, only the admin-triggered manual sync
works. Since both sources are scraped HTML rather than a stable API, a
future markup change on either site could break that source's parsing —
the endpoint reports each source's success/row-count/error independently
rather than failing silently, so that'd show up in the `/admin` sync
response, not as a mysterious data gap.

## Project structure

```
src/
  app/                  routes (see below)
  components/           shared UI (PostCard, VoteButtons, badges, forms...)
  lib/
    data.ts             all server-side data-fetch helpers (fail soft if
                         Supabase isn't configured yet)
    data-sources/        real scrapers for the two govt price sources (ampis,
                         kalimati) + the crop-name mapping between them
    ai/factcheck.ts      the OpenRouter-based safety classifier
    supabase/            browser / server / middleware / admin client factories
    i18n/                Nepali-first / English-toggle dictionary + context
  types/database.ts     hand-written types mirroring the SQL schema
supabase/
  migrations/           schema, RLS, storage bucket, guest/AI/feedback,
                         avatars/verification additions
  seed.sql              facts-layer data — real where we could verify it,
                         explicit about what's still illustrative
scripts/
  apply-seed.mjs        applies seed.sql's data via the JS client instead of
                         the SQL Editor (used when SQL Editor paste fails)
  seed-demo.mjs          creates demo farmer accounts + posts + comments
  remove-demo.mjs        removes everything seed-demo.mjs created
```

### Pages

| Route | Purpose |
|---|---|
| `/` | Landing — hero, live stats, recent community activity, quick links, then collapsed "why"/"how it works" |
| `/feed` | Main community feed — filter by crop/district/type, sort new/top |
| `/post/new` | Create a post — guest-friendly (no login required), photo upload for pest/disease reports |
| `/post/[id]` | Post detail + threaded comments, best-answer marking, AI safety badges |
| `/crops/[crop]` | Baseline "general guidance" + live community feed for that crop |
| `/tools`, `/tools/[tool]` | Agri-tech directory, tabbed **In Nepal** / **Global \| Emerging** — purchase *and* rental/service price, honest availability status, linked subsidy, vendors, community reviews |
| `/schemes` | Government scheme directory, "last verified" surfaced prominently |
| `/prices` | Aggregated market prices with a simple trend indicator |
| `/vendors` | Crop buyers + equipment suppliers/rental/service providers |
| `/profile/[id]` | District, crops grown, post history, verified badge |
| `/login` | Phone / email / Google / Facebook — plus silent guest-to-verified upgrade |
| `/admin` | Price sync trigger, feedback inbox, report moderation, verified-badge management (restricted via `ADMIN_USER_IDS`) |

A floating **💬 Feedback** button (bottom-left, every page) accepts a
message with optional name/contact from literally anyone — no session, no
account, not even the silent guest sign-in.

## Design notes

- **Facts vs. community**: reference tables (`zones`, `crops`, `schemes`,
  `market_prices`, `equipment`) are seeded once and rarely change; everything
  experiential (`posts`, `comments`, `votes`) is user-generated and is the
  actual point of the product. Crop and tool pages show the reference data
  clearly labeled "general guidance" above the live community feed.
- **Scale-appropriate mechanization**: the `/tools` directory always shows
  purchase price *and* rental/service price side by side — ownership rarely
  pencils out at Nepal's ~0.7 ha average landholding, but rental/custom-hire
  usually does. `availability_status` (`available_in_nepal` /
  `import_only` / `pilot_stage` / `service_only`) is shown as a badge on
  every tool so the UI never implies wider availability than is real.
- **Voting**: the `votes` table's unique constraint is
  `(user_id, post_id, comment_id)`; since Postgres treats `NULL <> NULL`,
  that constraint alone won't dedupe a user's post votes (comment_id is
  null). [VoteButtons.tsx](src/components/VoteButtons.tsx) looks up any
  existing vote for the user+target itself before writing, so this is
  handled in application logic.
- **Slugs**: `crops` and `equipment` don't have a `slug` column in the
  schema; `/crops/[crop]` and `/tools/[tool]` match on a slug computed from
  `name_en` / `name` at request time ([lib/slug.ts](src/lib/slug.ts)) rather
  than a numeric id, so URLs stay readable.
- **Guest posting**: [lib/auth.ts](src/lib/auth.ts)'s `ensureSession()` is
  called wherever an action needs a user row — voting, posting, commenting,
  reporting — and silently starts a Supabase **anonymous** session (no form,
  no redirect) if there isn't one already, plus a matching `profiles` row
  flagged `is_guest`. `GuestIdentityFields` on the post/comment forms let a
  guest optionally leave a name and a phone/email (`profiles.contact_info`)
  so they're not just "Anonymous." If they later verify a real phone/email
  on `/login`, that uses Supabase's identity-linking flow
  (`updateUser` + `verifyOtp({ type: "phone_change" | "email_change" })`)
  instead of creating a second account — their existing posts/votes/profile
  id carry over unchanged. `/feed`, `/crops/[crop]`, etc. never required
  login to *read* — this only affects posting/voting/reporting.
- **AI safety signal**: after a post or comment is created, the client
  fire-and-forgets a call to `/api/ai/check`
  ([route.ts](src/app/api/ai/check/route.ts)), which classifies it via
  OpenRouter ([lib/ai/factcheck.ts](src/lib/ai/factcheck.ts)) as
  safe/caution/danger/unverified and writes the result using the
  service-role client. A `BEFORE UPDATE` trigger
  (`protect_ai_columns`, migration `0004`) reverts any change to the
  `ai_verdict`/`ai_rationale`/`ai_checked_at` columns unless the writer is
  `service_role` — otherwise a post/comment's own author could forge their
  own "safe" label via a raw REST call. A missing API key, a network error,
  or an unparseable model response all resolve to no badge shown, never an
  error surfaced to the person posting.
- **Best-answer marking**: a post's author can mark one comment on their own
  post as the best answer (`comments.is_best_answer`), via the
  `"post author marks best answer"` RLS policy in migration `0004`. That
  policy is row-level, like all RLS — it technically also lets the post
  author edit other fields of someone else's comment through a
  hand-crafted API call, not just `is_best_answer`. Accepted as a
  low-severity tradeoff (scoped to the post's own author, on their own
  post's comments only) rather than adding column-level `GRANT`s for this
  MVP.
- **Market price sync**: real, against two official sources — see setup
  step 7 above.
- **Feed authenticity, without publishing anyone's phone number**: showing
  "who really posted this" was a real ask, but the honest tradeoff is that
  publishing a farmer's raw phone/email on a public page just invites spam
  and harassment. Instead, [AuthorIdentity.tsx](src/components/AuthorIdentity.tsx)
  shows an avatar (the real photo from Google/Facebook when that's how
  someone signed in) plus a "verified via phone/email/Google/Facebook"
  signal, or an explicit **Guest** pill when there's none — a real,
  visible authenticity signal that doesn't dox anyone.
  `profiles.contact_info` (a guest's optional self-reported phone/email)
  stays private to admins/moderation, same as before.
- **Real vendor/scheme data, honestly scoped**: seed.sql's schemes and
  vendors were fully fictional placeholders before; both are now real,
  sourced organizations we could actually verify (PM-AMP, the Krishi Gyan
  Kendra network, a provincial Directorate of Agriculture Development
  example, Mahindra Farm Equipment's Nepal dealer network, National Seed
  Company Ltd.). We deliberately did **not** invent a real-sounding
  drone-service company, a specific local agrovet, or a crop-buyer — we
  couldn't verify one, so that vendor_type stays empty until a real
  vendor (or a farmer recommending one) signs up through the platform
  itself, which is the actual long-term source of vendor coverage —
  Krisearch's whole model is community-submitted content, not a
  pre-populated directory a handful of web searches could ever complete.
  Local-government (municipality-level) scheme details are similarly
  flagged as genuinely not centrally listable (753 municipalities) rather
  than guessed at.
- **Tools grid**: was one full-width section per category — with ~1 item in
  several categories, that meant mostly-empty rows stacked vertically.
  [ToolsClient.tsx](src/components/ToolsClient.tsx) now renders one
  responsive grid (2–4 columns depending on viewport) with category filter
  chips instead.
- **Motion**: a real "modern, animated" pass via Framer Motion — hero
  fade-in, count-up stat numbers ([AnimatedCounter.tsx](src/components/AnimatedCounter.tsx)),
  staggered post-card reveal, and click-to-expand "why"/"how it works"
  sections ([CollapsibleSection.tsx](src/components/CollapsibleSection.tsx))
  instead of always-on marketing copy. Deliberately CSS/Framer Motion, not
  WebGL/three.js "3D" — this is a mobile-first app for potentially
  low-end phones and slow connections, and heavy 3D rendering would work
  against that more than it would help.
- **Homepage order**: hero → live stats → recent activity → quick links →
  collapsed explainer sections, so a visitor sees real platform activity
  before any marketing copy, matching the "get me useful info fast" ask.
- **Language coverage**: the dictionary ([lib/i18n/dictionary.ts](src/lib/i18n/dictionary.ts))
  covers the landing page, feed, tools (list + detail), crops, schemes,
  prices, vendors, post/comment forms, login, and the feedback widget — the
  highest-traffic surfaces. `/post/[id]`'s own chrome (not its user-authored
  content, which is whatever language the poster wrote in) and `/profile/[id]`
  still have a few hardcoded English strings; `/admin` is intentionally
  English-only as an internal tool. Add new UI text as a dictionary key (both
  `ne` and `en`) rather than a hardcoded string, and wire it in with
  `useLanguage()`'s `t()`.
- **Visual pass**: cards use a consistent `rounded-2xl` + `shadow-sm` +
  hover-elevate treatment, the homepage now shows real live counts (posts,
  members, districts, crops — via `getPlatformStats()`) instead of just
  static copy, and the background/header both got a less "default Tailwind"
  treatment. This was reviewed via `next build` + HTTP smoke checks in this
  environment (no headless-browser screenshot tool was available here) —
  worth a quick look at `npm run dev` yourself to confirm it reads the way
  you want.
