# Krisearch — कृषिSearch

**Agricultural information and community knowledge for Nepal.**

[Open Krisearch](https://krisearch.vercel.app/) · [Setup and implementation guide](docs/SETUP_AND_IMPLEMENTATION.md)

Krisearch brings crop information, market data, vendors, equipment and community
discussions into a bilingual platform. It reflects my interest in applying
software and AI to practical agricultural problems in Nepal.

## What the platform includes

- Crop, district, equipment, vendor and government-scheme reference pages.
- Questions, experience sharing, comments, voting and best-answer selection.
- Market-price source integrations and district-level weather information.
- Search with English, Nepali and romanized-Nepali crop synonyms.
- Guest participation, account sign-in and administrator moderation tools.
- Optional AI-assisted text review, search overviews and photo first-look features.
- Progressive web app, offline fallback and browser-dependent voice tools.
- Light, dark and system themes with a remembered browser preference.
- Searchable `/crops` directory with bilingual/romanized aliases and category filters.
- Saved crop and post links at `/saved`, stored in this browser without sign-in.
- Task-based homepage shortcuts and a complete mobile section menu.
- Market-date freshness labels and comparisons separated by price unit and source/variety.

Reference information, community posts and AI-generated text serve different
purposes. AI output is an assistive signal and is not independently verified
agronomic advice. Coverage, source freshness and language support vary by page.

## Source automation and AI

Daily source jobs import official market prices and agricultural notices. Prices retain the source publication date; new structured vendor/tool/scheme imports are reviewed before publication. Pages refresh while visible, and administrators can inspect job results and run imports manually. English/Nepali AI questions and separately labeled feed replies support Gemini or OpenRouter, remaining disabled until a provider is configured.

Apply migration `0010_automation.sql` and configure the production environment before activating the worker. Additional catalogs require genuine approved provider feeds. See the [automation runbook](docs/AUTOMATION.md) for setup, feed contracts, budgets and operational limits.

## Run locally

Requires Node.js 20.9+ and npm. Uses Next.js 16, TypeScript, Tailwind CSS and Supabase.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Without a configured Supabase project, data pages
display setup notices and empty states. To enable the actual data workflows,
create a development Supabase project, configure environment variables, apply
the migrations in `supabase/migrations/` in order and load appropriate reference
data. The [detailed guide](docs/SETUP_AND_IMPLEMENTATION.md) lists the variables,
auth providers, migrations, seeds, admin setup and optional AI configuration.
Copy the committed `.env.local.example` to `.env.local` for a local configuration
template. Keep server-only credentials out of `NEXT_PUBLIC_*` variables.

## Repository map

| Path | Purpose |
| --- | --- |
| `src/app/` | Pages and server-side routes |
| `src/components/` | Community, search, market and profile interfaces |
| `src/lib/` | Data access, language support, sources and AI integrations |
| `supabase/` | Schema, access policies, migrations and seed data |
| `scripts/` | Reference/demo-data setup utilities |
| `public/sw.js` | Offline service worker |

## Development checks and remaining work

```sh
npm run lint
npm test
npm run build
```

`npm test` covers saved-resource validation, crop aliases, search filter input,
market unit grouping and freshness/date handling. It runs without database
credentials. These focused checks do not replace database-policy or browser tests.

Saved resources are links stored locally, capped at 200; they do not sync across
devices or download full offline articles. The service worker caches immutable
build assets and a generic offline page, not account HTML, RSC payloads, APIs or
market data. Old Krisearch caches are retired when the worker updates.

Remaining backend and product work is tracked in [the improvement roadmap](docs/IMPROVEMENT_ROADMAP.md),
including private profile access, best-answer permissions and AI abuse controls.
No production database migrations were applied as part of this UI update.

Future evaluation should include retrieval quality, citation accuracy, bilingual
usability and feedback from agricultural users and domain reviewers.
