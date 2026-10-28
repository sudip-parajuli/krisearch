# Krisearch improvement review

## Delivered in this update

- Manual light/dark/system preference, applied before hydration and retained across navigation/reloads.
- Accessible theme control, skip link, language-aware document metadata, reduced-motion handling and mobile safe-area spacing.
- Complete mobile section navigation instead of hiding weather, prices, schemes and vendors.
- Homepage search and task shortcuts; the existing green/earth visual identity remains.
- `/crops` directory with categories and English/Nepali/Romanized Nepali name matching. Links use real database crops rather than a hard-coded rice shortcut.
- Browser-local crop/post bookmarks and a `/saved` collection; clear storage failure, limit and empty states.
- Market comparisons grouped by crop, market, **unit and source/variety description**, sorted by recorded date. Missing prices are no longer printed as numeric quotes; older/unknown dates are labeled.
- Search components reset on query changes, preventing a previous crop's AI overview from remaining on a new search. Search filter grammar is stripped from user input and query length bounded.
- Loading and recovery screens; offline caching is restricted to build assets and a generic fallback, keeping authenticated HTML and changing data out of the cache.
- Reproducible helper tests and a checked-in local environment template.

## Next backend priorities

These are findings from the repository, not claims that they have been fixed in the deployed database.

1. **Profile privacy.** The schema's public profile SELECT policy covers entire rows, including `contact_info`. Audit the deployed grants/policies, separate private contact information from public identity fields, and test anonymous/self/other-user access directly through the database API. Hiding a field in React is insufficient.
2. **Best-answer permissions.** The UI asks a post author to update another author's comment, while comment UPDATE policies are author-scoped. Implement a narrowly authorized operation that changes only answer-selection fields and validates post ownership, rather than broadening comment-edit permissions.
3. **AI endpoints.** Add request-size/type checks, ownership checks for persisted classifications, distributed quotas and model timeouts. Restrict photo URLs to trusted upload locations. Confirm cost and provider behavior before advertising scale.
4. **Operational confidence.** Exercise migrations and RLS against an isolated test database, define backup/recovery procedures, and make query failures distinguishable from legitimately empty content.

## Product opportunities after the foundations

- District and crop preferences with a farm dashboard that joins existing weather, market and community data.
- Reviewed seasonal calendars, with region-specific sources and verification dates.
- Better provenance and update monitoring for market feeds, schemes and crop references.
- Optional account-backed bookmark sync with explicit local-to-account migration.
- Usability sessions with Nepali farmers and agricultural reviewers, including low-end phones and intermittent connectivity.

Do not describe community posts or AI output as independently verified agricultural advice. Product quality should be measured by retrieval relevance, source freshness, bilingual usability and successful tasks, alongside technical checks.
