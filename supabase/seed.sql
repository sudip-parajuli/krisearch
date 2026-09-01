-- Krisearch seed data
-- Illustrative starter data for the facts layer, re-runnable safely: every
-- INSERT below targets a real unique constraint (see migration 0005), so
-- running this file again refreshes existing rows instead of duplicating
-- them. Not a verified production dataset end to end — the equipment
-- source_url/video_url links were checked live when this file was written;
-- the schemes are still illustrative placeholders (see their own note below)
-- and last_verified dates mark when this file was written, not when the
-- underlying fact was field-confirmed.

-- ============ ZONES ============
insert into zones (name, altitude_min, altitude_max, description) values
  ('Terai', 60, 300, 'Flat plains along the southern border; Nepal''s main grain belt.'),
  ('Siwalik', 300, 1500, 'Low outer foothills (Chure range); fragile soils, mixed farming.'),
  ('Middle Hill', 700, 2000, 'Densely settled hill terraces; the classic smallholder heartland.'),
  ('High Hill', 2000, 3000, 'Higher hill terraces; shorter growing season, more livestock reliance.'),
  ('Mountain', 3000, 4000, 'High Himalayan valleys; limited arable land, short summer cropping.'),
  ('High Mountain', 4000, 5500, 'Trans-Himalayan/alpine; minimal cropping, mostly pastoral.')
on conflict (name) do nothing;

-- ============ DISTRICTS (representative subset, not exhaustive) ============
insert into districts (name, province, zone_id) values
  ('Jhapa', 'Koshi', 1),
  ('Morang', 'Koshi', 1),
  ('Sunsari', 'Koshi', 1),
  ('Ilam', 'Koshi', 3),
  ('Taplejung', 'Koshi', 5),
  ('Saptari', 'Madhesh', 1),
  ('Dhanusha', 'Madhesh', 1),
  ('Sarlahi', 'Madhesh', 1),
  ('Kathmandu', 'Bagmati', 3),
  ('Bhaktapur', 'Bagmati', 3),
  ('Kavrepalanchok', 'Bagmati', 3),
  ('Sindhupalchok', 'Bagmati', 4),
  ('Rasuwa', 'Bagmati', 5),
  ('Chitwan', 'Bagmati', 1),
  ('Gorkha', 'Gandaki', 4),
  ('Kaski', 'Gandaki', 3),
  ('Mustang', 'Gandaki', 6),
  ('Nawalparasi', 'Gandaki', 1),
  ('Rupandehi', 'Lumbini', 1),
  ('Palpa', 'Lumbini', 3),
  ('Dang', 'Lumbini', 2),
  ('Salyan', 'Karnali', 4),
  ('Jumla', 'Karnali', 5),
  ('Surkhet', 'Karnali', 3),
  ('Kailali', 'Sudurpashchim', 1),
  ('Kanchanpur', 'Sudurpashchim', 1),
  ('Baitadi', 'Sudurpashchim', 4)
on conflict (name, province) do nothing;

-- ============ CROPS ============
insert into crops (name_en, name_np, category, baseline_notes) values
  ('Rice', 'धान', 'cereal', 'Main staple, dominant in Terai and irrigated hill valleys. Monsoon (main) and spring crop cycles.'),
  ('Maize', 'मकै', 'cereal', 'Key hill staple, often intercropped with legumes on terraced land.'),
  ('Wheat', 'गहुँ', 'cereal', 'Winter cereal, widely grown in Terai and mid-hills after rice/maize.'),
  ('Millet (Kodo)', 'कोदो', 'cereal', 'Drought-tolerant hill staple, important for food security at higher elevations.'),
  ('Potato', 'आलु', 'vegetable', 'Grown across nearly all zones; a major cash and subsistence crop in the hills.'),
  ('Tomato', 'गोलभेडा', 'vegetable', 'High-value crop, increasingly grown under plastic tunnels in hills and Terai.'),
  ('Cauliflower', 'काउली', 'vegetable', 'Popular winter vegetable, strong market demand near urban centers.'),
  ('Cabbage', 'बन्दा', 'vegetable', 'Common winter vegetable, similar growing conditions to cauliflower.'),
  ('Onion', 'प्याज', 'vegetable', 'Import-dependent nationally; local production is a policy priority.'),
  ('Carrot', 'गाजर', 'vegetable', 'Widely grown winter root vegetable, strong demand from urban markets.'),
  ('Mustard', 'तोरी', 'cash_crop', 'Major winter oilseed, grown widely across Terai and mid-hills.'),
  ('Lentil (Musuro)', 'मुसुरो', 'cash_crop', 'Nepal is a major global lentil exporter; grown post-rice in Terai.'),
  ('Chickpea (Chana)', 'चना', 'cash_crop', 'Winter legume, mostly Terai; improves soil nitrogen.'),
  ('Sugarcane', 'उखु', 'cash_crop', 'Terai cash crop tied to local sugar mill contracts.'),
  ('Ginger', 'अदुवा', 'spice', 'High-value hill cash crop; Nepal is among the world''s top producers.'),
  ('Chilli (Dry)', 'सुकेको खुर्सानी', 'spice', 'High-value dried spice crop, strong wholesale demand year-round.'),
  ('Cardamom (Large)', 'अलैंची', 'spice', 'Major eastern hill export crop, grown under forest shade.'),
  ('Tea', 'चिया', 'cash_crop', 'Concentrated in Ilam, Jhapa, Panchthar; orthodox and CTC production.'),
  ('Apple', 'स्याउ', 'fruit', 'High-hill/mountain fruit crop, especially Mustang, Jumla, and nearby districts.'),
  ('Banana', 'केरा', 'fruit', 'Major Terai fruit crop, sold fresh and year-round.'),
  ('Citrus (Junar/Orange)', 'सुन्तला', 'fruit', 'Mid-hill fruit crop, vulnerable to citrus greening disease.'),
  ('Mushroom (Button)', 'च्याउ', 'vegetable', 'High-value, short-cycle crop increasingly grown by smallholders near urban markets.'),
  ('Buffalo (Dairy)', 'भैंसी', 'livestock', 'Primary dairy animal for most smallholder households.'),
  ('Goat', 'बाख्रा', 'livestock', 'Widespread smallholder livestock, important for cash income and meat.')
on conflict (name_en) do nothing;

-- ============ CROP_ZONES (typical planting windows, baseline only) ============
insert into crop_zones (crop_id, zone_id, typical_planting_months)
select c.id, z.id, v.months from (values
  ('Rice', 'Terai', 'Jun-Jul'),
  ('Rice', 'Middle Hill', 'Jun-Jul'),
  ('Maize', 'Middle Hill', 'Mar-Apr'),
  ('Maize', 'High Hill', 'Apr-May'),
  ('Wheat', 'Terai', 'Nov-Dec'),
  ('Wheat', 'Middle Hill', 'Nov-Dec'),
  ('Potato', 'Middle Hill', 'Oct-Nov'),
  ('Potato', 'High Hill', 'Apr-May'),
  ('Tomato', 'Middle Hill', 'Feb-Mar'),
  ('Tomato', 'Terai', 'Sep-Oct'),
  ('Cauliflower', 'Middle Hill', 'Aug-Sep'),
  ('Mustard', 'Terai', 'Oct-Nov'),
  ('Lentil (Musuro)', 'Terai', 'Oct-Nov'),
  ('Ginger', 'Middle Hill', 'Mar-Apr'),
  ('Cardamom (Large)', 'High Hill', 'Apr-May'),
  ('Tea', 'Middle Hill', 'Year-round (perennial)'),
  ('Apple', 'Mountain', 'Dec-Jan (dormant planting)'),
  ('Citrus (Junar/Orange)', 'Middle Hill', 'Jul-Aug')
) as v(crop_name, zone_name, months)
join crops c on c.name_en = v.crop_name
join zones z on z.name = v.zone_name
on conflict do nothing;

-- ============ TAGS ============
insert into tags (name) values
  ('blight'), ('pest'), ('organic'), ('urgent'), ('good-buyer'), ('scam-alert'),
  ('irrigation'), ('drought'), ('flood'), ('soil-health'), ('seed-source'), ('success-story')
on conflict (name) do nothing;

-- ============ SCHEMES — real, sourced (central/provincial) ============
-- All checked live 2026-09-01. Note: Nepal's Ministry of Agriculture and
-- Livestock Development was merged into the new Ministry of Agriculture,
-- Forests and Environment on 2026-05-14 — it kept the moald.gov.np domain.
-- Local-government (municipality) programs genuinely aren't centrally
-- listable — see the last row, which says so honestly rather than
-- fabricating a specific one.
insert into schemes (title, description, subsidy_type, eligibility, how_to_apply, source_url, last_verified) values
  (
    'Prime Minister Agriculture Modernization Project (PM-AMP)',
    'Nepal''s largest national agriculture program, run by the Ministry of Agriculture, Forests and Environment (formerly the Ministry of Agriculture and Livestock Development, merged 2026-05-14). Supports commercial-scale agriculture through four tiers — Pocket (min. 10 ha), Block (min. 100 ha), Zone (min. 500 ha, with processing), and Super Zone (min. 1,000 ha, industrial-scale) — providing mechanization equipment, processing/marketing infrastructure, cold storage, and entrepreneurship development support. As of writing: 9,393 pockets, 1,699 blocks, 206 zones, and 21 super zones established nationwide.',
    'mechanization_and_infrastructure_support',
    'Farmer groups/cooperatives within an area already designated as a PM-AMP pocket/block/zone/super zone, or proposing a new one. Designation is based on "national priorities and local feasibility" set by the Program Management Unit.',
    'Contact the PM-AMP Program Management Unit (Khumaltar, Lalitpur — phone 01-5446906, email pmamp.pmu@gmail.com) or your nearest subordinate Pocket/Block/Zone office listed on the PM-AMP website.',
    'https://pmamp.gov.np/en/',
    '2026-09-01'
  ),
  (
    'Krishi Gyan Kendra (Agriculture Knowledge Center) network',
    'Nepal''s network of local Agriculture Knowledge Centers, under each province''s Directorate of Agriculture Development, is the standard first point of contact for ANY government agriculture subsidy, technical advice, or equipment-support scheme — federal, provincial, or local. This is a general entry point, not one specific subsidy.',
    'advisory_and_referral',
    'Any registered farmer or farmer group.',
    'Visit your district''s Krishi Gyan Kendra in person, or contact your province''s Directorate of Agriculture Development to ask what''s currently open (example — Koshi Province: 021-5165568, doadprovince1@gmail.com).',
    'https://doad.koshi.gov.np/agriculture-knowledge-center',
    '2026-09-01'
  ),
  (
    'Provincial agriculture subsidy programs (varies by province)',
    'Each of Nepal''s 7 provinces runs its own Directorate of Agriculture Development with province-specific annual subsidy programs (seeds, equipment, irrigation, etc.). These vary by province and by fiscal-year budget and are not standardized nationally — we can''t list all 7 here.',
    'varies_by_province',
    'Varies by province and program.',
    'Contact your provincial Directorate of Agriculture Development directly. Example — Koshi Province: 021-5165568, doadprovince1@gmail.com, doad.koshi.gov.np. Other provinces have an equivalent office; ask your local Krishi Gyan Kendra which one covers you.',
    'https://doad.koshi.gov.np/agriculture-knowledge-center',
    '2026-09-01'
  ),
  (
    'Local government (Gaunpalika / Nagarpalika) agriculture programs',
    'Nepal''s 753 local governments each set their own small annual agriculture budget (seed/plough/irrigation subsidies, grants for youth agri-entrepreneurs, etc.) as part of local planning. Program details differ by municipality and aren''t centrally published anywhere we could verify — genuinely can''t be listed here specifically.',
    'varies_by_municipality',
    'Varies by municipality — typically residents/farmers registered within that local government''s area.',
    'Contact your Ward Office or municipality''s agriculture branch directly, or ask at your local Krishi Gyan Kendra which local programs are currently open.',
    null,
    '2026-09-01'
  )
on conflict (title) do update set
  description = excluded.description,
  subsidy_type = excluded.subsidy_type,
  eligibility = excluded.eligibility,
  how_to_apply = excluded.how_to_apply,
  source_url = excluded.source_url,
  last_verified = excluded.last_verified;

-- ============ EQUIPMENT (Nepal) ============
-- source_url / video_url below were checked live while writing this file:
-- two real Nepal-focused YouTube price/demo videos, and a real Nepal
-- e-commerce category page for irrigation parts. Where no verified link was
-- found, both stay null rather than guessing — the UI shows "unverified
-- estimate" for those, same as before.
insert into equipment (name, name_np, category, description, how_it_helps, purchase_price_min, purchase_price_max, rental_price, rental_price_unit, availability_status, related_scheme_id, source_url, video_url, last_verified, scope) values
  (
    'Agricultural Spraying Drone',
    'कृषि स्प्रे ड्रोन',
    'drone',
    'Multirotor drone fitted with a tank and nozzles for pesticide/fertilizer spraying.',
    'Cuts spraying time and chemical exposure sharply versus manual knapsack spraying; most useful on medium-to-larger or pooled plots.',
    700000, 900000, 1500, 'per acre spray',
    'service_only',
    (select id from schemes where title = 'Prime Minister Agriculture Modernization Project (PM-AMP)'),
    null,
    'https://www.youtube.com/watch?v=0ksIHQ8KCfU',
    '2026-06-01',
    'nepal'
  ),
  (
    'Mini-Tiller (Power Tiller, Walk-Behind)',
    'मिनी टिलर (पावर टिलर)',
    'machinery',
    'Small walk-behind tiller sized for terraced and fragmented hill/Terai plots.',
    'Right-sized mechanization for plots too small or steep for a full tractor; cuts land-prep labor and time.',
    120000, 220000, 1500, 'per day',
    'available_in_nepal',
    (select id from schemes where title = 'Prime Minister Agriculture Modernization Project (PM-AMP)'),
    null,
    'https://www.youtube.com/watch?v=F1baBchwgTg',
    '2026-05-10',
    'nepal'
  ),
  (
    'Solar Irrigation Pump',
    'सोलार सिँचाइ पम्प',
    'solar',
    'Solar-powered water pump for lifting irrigation water without grid electricity or diesel.',
    'Removes recurring diesel cost and gives off-grid plots reliable irrigation access.',
    150000, 350000, null, null,
    'available_in_nepal',
    null,
    null,
    null,
    '2026-04-20',
    'nepal'
  ),
  (
    'Drip Irrigation Kit (per Ropani)',
    'ड्रिप सिँचाइ किट',
    'irrigation',
    'Tubing, emitters, and filter kit sized for small-plot drip irrigation.',
    'Cuts water use substantially versus flood irrigation and improves yield consistency for vegetables.',
    8000, 25000, null, null,
    'available_in_nepal',
    null,
    'https://hardwarepasal.com/category/irrigation',
    null,
    '2026-08-30',
    'nepal'
  ),
  (
    'IoT Soil-Moisture Sensor Kit',
    'माटो-आर्द्रता सेन्सर किट',
    'iot_sensor',
    'Wireless soil-moisture/temperature sensors with a phone-app dashboard.',
    'Tells farmers when a plot actually needs water instead of guessing, saving both water and pump-running cost. NGO-backed pilots (e.g. AgriSmart-style programs) currently subsidize kits in a handful of districts rather than this being an open retail product yet.',
    15000, 45000, null, null,
    'pilot_stage',
    null,
    null,
    null,
    '2026-03-15',
    'nepal'
  ),
  (
    'Small Greenhouse / Polyhouse Kit',
    'साना ग्रीनहाउस / पोलिहाउस किट',
    'greenhouse',
    'Bamboo or steel-frame polyhouse kit sized for small vegetable plots (roughly 20x8 m).',
    'Extends the growing season and protects high-value vegetables (tomato, cucumber, capsicum) from hail and erratic rain.',
    60000, 180000, null, null,
    'available_in_nepal',
    (select id from schemes where title = 'Prime Minister Agriculture Modernization Project (PM-AMP)'),
    null,
    null,
    '2026-05-01',
    'nepal'
  ),
  (
    'Solar Dryer (Post-Harvest)',
    'सोलार ड्रायर',
    'post_harvest',
    'Solar-powered dehydration unit for grains, spices, and fruit.',
    'Reduces post-harvest spoilage and lets farmers sell dried/higher-value product instead of raw perishables.',
    30000, 90000, null, null,
    'pilot_stage',
    null,
    null,
    null,
    '2026-02-10',
    'nepal'
  ),
  (
    'Farm Management Mobile App',
    'कृषि व्यवस्थापन मोबाइल एप',
    'digital_app',
    'Smartphone app for tracking planting dates, expenses, and reminders.',
    'Helps farmers plan input timing and keep basic records without paper bookkeeping.',
    0, 0, null, null,
    'available_in_nepal',
    null,
    null,
    null,
    '2026-06-15',
    'nepal'
  )
on conflict (name) do update set
  name_np = excluded.name_np,
  category = excluded.category,
  description = excluded.description,
  how_it_helps = excluded.how_it_helps,
  purchase_price_min = excluded.purchase_price_min,
  purchase_price_max = excluded.purchase_price_max,
  rental_price = excluded.rental_price,
  rental_price_unit = excluded.rental_price_unit,
  availability_status = excluded.availability_status,
  related_scheme_id = excluded.related_scheme_id,
  source_url = excluded.source_url,
  video_url = excluded.video_url,
  last_verified = excluded.last_verified,
  scope = excluded.scope;

-- ============ GLOBAL / EMERGING TECH (shown for awareness, not Nepal-priced) ============
-- Illustrative only — these are examples of technology categories used
-- elsewhere in the world, not verified product listings. Nepal availability
-- is intentionally marked pilot_stage/import_only, never available_in_nepal,
-- until a specific real product with a real Nepal presence is added here.
-- source_url values are real reference pages checked live while writing
-- this file (a Wikipedia article, and two industry overview articles).
insert into equipment (name, name_np, category, description, how_it_helps, purchase_price_min, purchase_price_max, rental_price, rental_price_unit, availability_status, related_scheme_id, source_url, video_url, last_verified, scope) values
  (
    'Autonomous Field Robots',
    'स्वचालित कृषि रोबोट',
    'machinery',
    'Small self-driving robots for weeding, seeding, or monitoring row crops, used commercially in parts of Europe and North America.',
    'Removes manual weeding labor; used mainly on large, uniform commercial fields today, not smallholder terraces.',
    null, null, null, null,
    'pilot_stage',
    null,
    'https://en.wikipedia.org/wiki/Weeding',
    null,
    '2026-06-01',
    'global'
  ),
  (
    'Satellite Precision-Agriculture Imagery',
    'स्याटेलाइट-आधारित सटीक कृषि',
    'digital_app',
    'Satellite/drone imagery services that flag crop stress, irrigation gaps, and yield estimates over large areas.',
    'Lets a farm manager spot a problem area before it is visible on the ground, at large commercial scale.',
    null, null, null, null,
    'pilot_stage',
    null,
    null,
    null,
    '2026-06-01',
    'global'
  ),
  (
    'AI Crop-Disease Detection App (Global)',
    'एआई बाली-रोग पहिचान एप',
    'digital_app',
    'Phone-camera apps that identify crop diseases from a leaf photo using AI models trained on global crop-image datasets.',
    'Could give farmers an instant first read on a disease photo — accuracy for Nepal-specific crops/pests is not yet verified.',
    null, null, null, null,
    'pilot_stage',
    null,
    null,
    null,
    '2026-06-01',
    'global'
  ),
  (
    'Vertical Farming Systems',
    'ठाडो (भर्टिकल) खेती प्रणाली',
    'greenhouse',
    'Stacked, climate-controlled indoor growing systems, mostly for leafy greens, used in urban commercial operations abroad.',
    'High yield per square meter but high capital and energy cost — not yet a fit for typical Nepali smallholder economics.',
    null, null, null, null,
    'import_only',
    null,
    'https://farmonaut.com/precision-farming/new-method-of-farming-precision-vertical-agriculture-2026',
    null,
    '2026-06-01',
    'global'
  ),
  (
    'Blockchain Crop Traceability Platforms',
    'ब्लकचेन बाली-ट्रेसेबिलिटी प्रणाली',
    'digital_app',
    'Supply-chain platforms that record a crop''s journey from farm to buyer for provenance/certification purposes.',
    'Could help premium/export crops (e.g. cardamom, tea) prove origin to buyers, but requires buyer-side adoption too.',
    null, null, null, null,
    'pilot_stage',
    null,
    'https://intellias.com/blockchain-in-agriculture-supply-chain/',
    null,
    '2026-06-01',
    'global'
  )
on conflict (name) do update set
  name_np = excluded.name_np,
  category = excluded.category,
  description = excluded.description,
  how_it_helps = excluded.how_it_helps,
  availability_status = excluded.availability_status,
  source_url = excluded.source_url,
  video_url = excluded.video_url,
  last_verified = excluded.last_verified,
  scope = excluded.scope;

-- ============ MARKET PRICES ============
-- The two 'illustrative sample' rows per crop below are placeholder history
-- (kept so the /prices trend indicator has something to compare against).
-- The 'Kalimati wholesale (ramropatro.com)' rows are a REAL snapshot fetched
-- live while writing this file — see the URL in `source` — not simulated.
-- This is a one-time manual snapshot, not a live feed: /admin's price-sync
-- button explains why an automated feed isn't wired in yet.
insert into market_prices (crop_id, market_name, price_per_unit, unit, date_recorded, source)
select c.id, v.market, v.price, v.unit, v.d::date, v.source from (values
  ('Rice', 'Kalimati, Kathmandu', 65, 'per kg', '2026-08-10', 'illustrative sample'),
  ('Rice', 'Kalimati, Kathmandu', 68, 'per kg', '2026-08-17', 'illustrative sample'),
  ('Tomato', 'Kalimati, Kathmandu', 55, 'per kg', '2026-08-10', 'illustrative sample'),
  ('Tomato', 'Kalimati, Kathmandu', 40, 'per kg', '2026-08-17', 'illustrative sample'),
  ('Potato', 'Kalimati, Kathmandu', 45, 'per kg', '2026-08-10', 'illustrative sample'),
  ('Potato', 'Kalimati, Kathmandu', 48, 'per kg', '2026-08-17', 'illustrative sample'),
  -- Real snapshot, fetched 2026-08-30 from https://ramropatro.com/vegetable (Kalimati wholesale):
  ('Tomato', 'Kalimati, Kathmandu', 75, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Potato', 'Kalimati, Kathmandu', 50, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Onion', 'Kalimati, Kathmandu', 94, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Carrot', 'Kalimati, Kathmandu', 110, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Cabbage', 'Kalimati, Kathmandu', 35, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Banana', 'Kalimati, Kathmandu', 275, 'per dozen', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Apple', 'Kalimati, Kathmandu', 367, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Mushroom (Button)', 'Kalimati, Kathmandu', 425, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Ginger', 'Kalimati, Kathmandu', 225, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)'),
  ('Chilli (Dry)', 'Kalimati, Kathmandu', 525, 'per kg', '2026-08-30', 'Kalimati wholesale (ramropatro.com)')
) as v(crop_name, market, price, unit, d, source)
join crops c on c.name_en = v.crop_name
on conflict (crop_id, market_name, date_recorded) do nothing;

-- ============ VENDORS — real organizations only (checked live 2026-09-01) ============
-- Deliberately short. We could only verify two organizations with a real,
-- public, checkable presence relevant to individual farmers — a
-- manufacturer's own Nepal dealer-network page, and a registered national
-- seed company. We did NOT find a verifiable real drone-spraying service or
-- a specific real local crop-buyer/agrovet with public contact info —
-- rather than invent one, those vendor_type categories are left for real
-- vendors/farmers to fill in themselves (Krisearch's whole model is
-- community-submitted content, not a pre-populated directory).
--
-- Cleans up an earlier version of this file that seeded 7 entirely made-up
-- businesses with fake phone numbers — safe no-op if you never had them.
delete from vendor_equipment where vendor_id in (
  select id from vendors where business_name in (
    'Himal Agro Machinery Pvt. Ltd.', 'Chitwan Custom Hiring Center', 'SkyField Drone Services',
    'Terai Solar Solutions', 'Kalimati Fresh Buyers Coop', 'Ilam Tea & Ginger Traders', 'Gorkha Agrovet Center'
  )
);
delete from vendors where business_name in (
  'Himal Agro Machinery Pvt. Ltd.', 'Chitwan Custom Hiring Center', 'SkyField Drone Services',
  'Terai Solar Solutions', 'Kalimati Fresh Buyers Coop', 'Ilam Tea & Ginger Traders', 'Gorkha Agrovet Center'
);

insert into vendors (business_name, vendor_type, district_id, contact_info, rating_avg) values
  (
    'Mahindra Farm Equipment (Nepal)',
    'equipment_supplier',
    null, -- nationwide dealer network, not one location
    'Official manufacturer page — use the Nepal dealer locator for your nearest of 14 authorized dealers: mahindrafarmequipment.com/nepal',
    null
  ),
  (
    'National Seed Company Ltd. (NSC)',
    'input_supplier',
    (select id from districts where name = 'Kathmandu'),
    'Central Office, Kuleshwor, Kathmandu — see nscl.org.np for your nearest area office',
    null
  )
on conflict (business_name, vendor_type) do update set
  district_id = excluded.district_id,
  contact_info = excluded.contact_info,
  rating_avg = excluded.rating_avg;

-- No vendor_equipment rows: we couldn't verify which specific catalog item
-- either real vendor actually stocks at what price — better to show
-- "no vendors listed yet" on a tool page than fabricate a price/product link
-- neither vendor has confirmed.
