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

Reference information, community posts and AI-generated text serve different
purposes. AI output is an assistive signal and is not independently verified
agronomic advice. Coverage, source freshness and language support vary by page.

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
npm run build
```

The repository does not yet include an automated regression suite. Database
permissions need dedicated tests: public profile reads must not expose private
contact fields, and best-answer selection should not permit editing another
person's comment. AI endpoints and public submissions also need abuse and quota
testing. These are implementation follow-ups, not fixes made by this README.

Future evaluation should include retrieval quality, citation accuracy, bilingual
usability and feedback from agricultural users and domain reviewers.
