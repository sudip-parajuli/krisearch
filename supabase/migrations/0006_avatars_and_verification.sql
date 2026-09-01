-- Lets the feed show who actually posted something without publishing raw
-- contact info (phone/email) publicly, which would just invite spam/
-- harassment of real farmers. Instead: an avatar (pulled from Google/
-- Facebook when that's how someone signed in) plus a "verified via" badge
-- (phone / email / google / facebook / guest) — a real, visible authenticity
-- signal that doesn't put anyone's phone number on a public page.

alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists verification_method text; -- 'phone' | 'email' | 'google' | 'facebook' | 'guest' | null

-- Same latent bug as migration 0005 (no real unique constraint -> ON CONFLICT
-- DO NOTHING never actually matches), just spotted later: schemes had no
-- natural key either, so seed.sql's schemes insert would have duplicated on
-- every re-run too.
alter table schemes add constraint schemes_title_key unique (title);
