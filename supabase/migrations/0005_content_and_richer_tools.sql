-- Fixes a latent bug in supabase/seed.sql: every INSERT there used
-- `on conflict do nothing` with no target — since every seeded table's only
-- unique column was the auto-generated serial `id`, that clause never
-- actually matched anything, so re-running seed.sql (e.g. to pick up new
-- tool info) would silently duplicate every zone/district/crop/equipment
-- row instead of updating or skipping them. This adds real unique
-- constraints on the natural key of each facts-layer table so ON CONFLICT
-- can target them correctly, and seed.sql is updated to upsert against them.
--
-- Also adds equipment.name_np (Nepali name, for language parity with crops)
-- and equipment.video_url (a real demo/explainer video where one exists).

alter table zones add constraint zones_name_key unique (name);
alter table districts add constraint districts_name_province_key unique (name, province);
alter table crops add constraint crops_name_en_key unique (name_en);
alter table equipment add constraint equipment_name_key unique (name);

alter table equipment add column if not exists name_np text;
alter table equipment add column if not exists video_url text;

-- market_prices is a time series (multiple dated rows per crop/market on
-- purpose), but a (crop, market, date) triple should still be a single
-- reading — same fix, so re-running the seed doesn't duplicate a day's price.
alter table market_prices add constraint market_prices_crop_market_date_key
  unique (crop_id, market_name, date_recorded);

-- Same fix for seeded vendors: a stable natural key so seed.sql's vendor
-- rows (and the vendor_equipment rows that reference them by name) can use
-- a real ON CONFLICT target instead of re-inserting on every seed run.
alter table vendors add constraint vendors_business_name_type_key
  unique (business_name, vendor_type);
