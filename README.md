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
run the files in [supabase/migrations/](supabase/migrations/) in order:

1. `0001_schema.sql` — facts layer + community layer tables
2. `0002_rls.sql` — Row Level Security policies
3. `0003_storage.sql` — the `post-images` storage bucket + upload policies

Then optionally load [supabase/seed.sql](supabase/seed.sql) for illustrative
starter data (zones, districts, ~20 crops, sample equipment/schemes/prices).
**It's illustrative, not verified production data** — re-check scheme
details and equipment prices/availability before relying on them; see the
comment at the top of the seed file.

### 3. Enable phone auth (primary sign-in method)

Krisearch defaults to phone-number sign-in, since many farmers don't check
email regularly (email is offered as a secondary option on the same
[/login](src/app/login/page.tsx) page). In Supabase: **Authentication →
Providers → Phone**, and configure an SMS provider (Twilio, MessageBird,
etc.) with your API credentials. Without this configured, phone OTP requests
will fail — the login page surfaces the Supabase error message when that
happens.

### 4. Set up admin access

Add the Supabase Auth user UUID(s) (Authentication → Users) of your admin
account(s) to `ADMIN_USER_IDS` in `.env.local` (comma-separated) to unlock
[/admin](src/app/admin/page.tsx) — reviewing reported content and
granting/revoking the `verified_badge` on profiles.

## Project structure

```
src/
  app/                  routes (see below)
  components/           shared UI (PostCard, VoteButtons, badges, forms...)
  lib/
    data.ts             all server-side data-fetch helpers (fail soft if
                         Supabase isn't configured yet)
    supabase/           browser / server / middleware / admin client factories
    i18n/                Nepali-first / English-toggle dictionary + context
  types/database.ts     hand-written types mirroring the SQL schema
supabase/
  migrations/           schema, RLS, storage bucket
  seed.sql              illustrative starter data
```

### Pages

| Route | Purpose |
|---|---|
| `/` | Landing — hero, how-it-works, recent community activity |
| `/feed` | Main community feed — filter by crop/district/type, sort new/top |
| `/post/new` | Create a post (photo upload for pest/disease reports) |
| `/post/[id]` | Post detail + threaded comments |
| `/crops/[crop]` | Baseline "general guidance" + live community feed for that crop |
| `/tools`, `/tools/[tool]` | Modern agri-tech directory — purchase *and* rental/service price, honest availability status, linked subsidy, vendors, community reviews |
| `/schemes` | Government scheme directory, "last verified" surfaced prominently |
| `/prices` | Aggregated market prices with a simple trend indicator |
| `/vendors` | Crop buyers + equipment suppliers/rental/service providers |
| `/profile/[id]` | District, crops grown, post history, verified badge |
| `/login` | Phone-first (email fallback) OTP sign-in |
| `/admin` | Moderation: open reports, verified-badge management (restricted via `ADMIN_USER_IDS`) |

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
