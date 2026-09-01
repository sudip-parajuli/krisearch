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
-- Coordinates are the district HQ town (approximate, for the weather
-- feature) — general guidance, not precise for every village in a district.
-- Requires migration 0009 (districts.latitude/longitude); do update so
-- re-running this file backfills coordinates onto rows seeded before 0009.
insert into districts (name, province, zone_id, latitude, longitude) values
  ('Jhapa', 'Koshi', 1, 26.5626, 87.9975),
  ('Morang', 'Koshi', 1, 26.4525, 87.2718),
  ('Sunsari', 'Koshi', 1, 26.6650, 87.2718),
  ('Ilam', 'Koshi', 3, 26.9096, 87.9271),
  ('Taplejung', 'Koshi', 5, 27.3500, 87.6667),
  ('Saptari', 'Madhesh', 1, 26.5390, 86.7500),
  ('Dhanusha', 'Madhesh', 1, 26.7288, 85.9266),
  ('Sarlahi', 'Madhesh', 1, 26.8600, 85.5600),
  ('Kathmandu', 'Bagmati', 3, 27.7172, 85.3240),
  ('Bhaktapur', 'Bagmati', 3, 27.6710, 85.4298),
  ('Kavrepalanchok', 'Bagmati', 3, 27.6217, 85.5484),
  ('Sindhupalchok', 'Bagmati', 4, 27.8167, 85.6833),
  ('Rasuwa', 'Bagmati', 5, 28.1167, 85.3167),
  ('Chitwan', 'Bagmati', 1, 27.6244, 84.4278),
  ('Gorkha', 'Gandaki', 4, 28.0000, 84.6333),
  ('Kaski', 'Gandaki', 3, 28.2096, 83.9856),
  ('Mustang', 'Gandaki', 6, 28.7833, 83.7167),
  ('Nawalparasi', 'Gandaki', 1, 27.6167, 83.9667),
  ('Rupandehi', 'Lumbini', 1, 27.7000, 83.4486),
  ('Palpa', 'Lumbini', 3, 27.8667, 83.5500),
  ('Dang', 'Lumbini', 2, 28.0500, 82.4833),
  ('Salyan', 'Karnali', 4, 28.3833, 82.1667),
  ('Jumla', 'Karnali', 5, 29.2747, 82.1838),
  ('Surkhet', 'Karnali', 3, 28.6000, 81.6167),
  ('Kailali', 'Sudurpashchim', 1, 28.6833, 80.6000),
  ('Kanchanpur', 'Sudurpashchim', 1, 28.9333, 80.1833),
  ('Baitadi', 'Sudurpashchim', 4, 29.5333, 80.4667)
on conflict (name, province) do update set
  zone_id = excluded.zone_id, latitude = excluded.latitude, longitude = excluded.longitude;

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
  ('Goat', 'बाख्रा', 'livestock', 'Widespread smallholder livestock, important for cash income and meat.'),
  ('Coffee', 'कफी', 'cash_crop', 'Grown in ~23 mid-hill districts (e.g. Kavre, Gorkha, Palpa, Syangja); a small but growing specialty-export crop, coordinated nationally by the Nepal Coffee Federation.'),
  ('Turmeric', 'बेसार', 'spice', 'Hill/Terai spice crop, usually intercropped; steady demand as both a spice and a dye.'),
  ('Garlic', 'लसुन', 'vegetable', 'Widely grown winter crop, high local demand, partly import-dependent like onion.'),
  ('Soybean', 'भटमास', 'cash_crop', 'Hill oilseed/protein crop, also eaten fresh as edamame-style भटमासकोशा.'),
  ('Buckwheat (Faper)', 'फापर', 'cereal', 'High-hill/mountain staple where rice/wheat don''t grow well; increasingly marketed as a specialty grain.'),
  ('Poultry (Chicken)', 'कुखुरा', 'livestock', 'Nepal''s most common smallholder livestock — broiler and layer farming both widespread.'),
  ('Milk (Dairy Products)', 'दूध', 'animal_product', 'The product, not the animal — cow/buffalo milk and processed dairy (curd, ghee, paneer). See Buffalo (Dairy) and Goat for the animals themselves.'),
  ('Egg', 'अन्डा', 'animal_product', 'Major smallholder income source alongside poultry meat; commercial layer farming is widespread near urban markets.'),
  ('Honey (Beekeeping)', 'मह (मौरीपालन)', 'animal_product', 'Growing smallholder sideline — both Apis cerana (traditional) and Apis mellifera (commercial) beekeeping are practiced.')
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
  ),
  (
    'Agriculture, Livestock & Herb Insurance (govt.-subsidized premium)',
    'Government-subsidized crop/livestock/herb insurance: 80% premium subsidy on coverage up to NPR 1 crore (10 million), 50% subsidy above that. Covers 27 crops (incl. paddy, potato, sugarcane, coffee, banana, tea, pulses, ginger, cardamom, timur, mango, and other fruits/vegetables) and 6 livestock/fisheries categories (poultry, pigs, fish, goats, cattle, fodder). Administered jointly by federal + provincial governments; insurance companies collect only the non-subsidized portion of the premium directly from farmers. The government has announced digitalization of the full insurance lifecycle (policy, premium, subsidy, claims) for FY 2026/27.',
    'insurance_premium_subsidy',
    'Farmers/farmer groups raising an eligible crop or livestock category; provincial governments oversee implementation, so specifics vary somewhat by province.',
    'Apply through a licensed insurance company offering the government-subsidized product (e.g. Nepal Insurance Company) or your provincial agriculture office; ask your local Krishi Gyan Kendra which insurer covers your district.',
    'https://en.nepalinsurance.com/policy/agriculture-livestock-insurance',
    '2026-09-01'
  ),
  (
    'Sana Kisan Bikas Laghubitta (SKBBL) Agriculture Loan',
    'SKBBL is a wholesale microfinance institution (est. 2001, HQ Babarmahal, Kathmandu) that channels low-cost credit through partner Small Farmer Agriculture Cooperatives Ltd. (SFACLs) and other cooperatives to reach small, marginalized, and women farmers who typically can''t access mainstream bank credit directly. Reports reaching around 4.5 million people nationally through its cooperative network.',
    'microfinance_loan',
    'Farmers who are members (or can join) a partner SFACL/cooperative in their area — this is wholesale lending through cooperatives, not a walk-in bank loan.',
    'Find and join your nearest partner cooperative/SFACL, or contact SKBBL directly for their agriculture loan product.',
    'https://www.skbbl.com.np/products/agriculture-loan',
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

-- ============ VENDORS — real organizations (checked live 2026-09-01) ============
-- Two provenance tiers, marked per-row below:
-- - INDEPENDENTLY VERIFIED: found via live web search (official site,
--   business registry, or a listing on another real platform).
-- - USER-PROVIDED, NOT RE-VERIFIED: a real Nepali agribusiness the user
--   supplied, internally consistent with the verified ones, but not
--   independently re-confirmed by us in every detail. No fabricated phone
--   numbers either way — only real emails/URLs we actually have.
-- crops_bought/crops_supplied below are a representative subset, not an
-- exhaustive catalog, for these large multi-product businesses.
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

insert into vendors (business_name, vendor_type, district_id, contact_info, crops_bought, crops_supplied, rating_avg) values
  -- --- independently verified ---
  ('Mahindra Farm Equipment (Nepal)', 'equipment_supplier', null,
   'Official manufacturer page — Nepal dealer locator for your nearest of 14 authorized dealers: mahindrafarmequipment.com/nepal',
   null, null, null),
  ('National Seed Company Ltd. (NSC)', 'input_supplier', (select id from districts where name = 'Kathmandu'),
   'Central Office, Kuleshwor, Kathmandu — nscl.org.np for your nearest area office',
   null, array(select id from crops where name_en in ('Rice', 'Maize', 'Wheat', 'Potato', 'Lentil (Musuro)')), null),
  ('Muktinath Krishi Company Ltd. (MKCL)', 'input_supplier', (select id from districts where name = 'Kathmandu'),
   'Basundhara, Ring Road, Kathmandu — NEPSE-listed (symbol: MKCL), a Muktinath Bikas Bank subsidiary. Seeds, fertilizers, crop-protection chemicals, technical guidance.',
   null, null, null),
  ('Muktinath Krishi Company Ltd. (MKCL)', 'equipment_supplier', (select id from districts where name = 'Kathmandu'),
   'Basundhara, Ring Road, Kathmandu — mini-tillers, power weeders, and other agriculture/livestock equipment.',
   null, null, null),
  ('Krishighar', 'input_supplier', null,
   'Online wholesale portal for agro-medicine, veterinary medicine & agro tools — krishighar.com.np',
   null, null, null),
  ('Krishi Bajar', 'input_supplier', null,
   'Online marketplace/directory connecting farmers to agrovets and listings for crops, manures, cattle, used machinery — krishibajar.com (a directory, not a single seller)',
   null, null, null),
  ('NMS Agro Pvt. Ltd.', 'input_supplier', null,
   'Distributes Bayer Cropscience crop-protection products and Neem India organic treatments — listed on krishibajar.com',
   null, null, null),
  ('Hardwarepasal', 'equipment_supplier', (select id from districts where name = 'Kathmandu'),
   'Online hardware & irrigation-parts retailer, Kathmandu — hardwarepasal.com',
   null, null, null),
  ('Grown in Nepal (by aQysta)', 'input_supplier', null,
   'Seeds, fertilizers, modern tools, pesticides — part of aQysta''s afforestation + coffee income-diversification program — growninnepal.com',
   null, array(select id from crops where name_en in ('Coffee')), null),
  ('Grown in Nepal (by aQysta)', 'crop_buyer', null,
   'Buys fresh fruits, vegetables, native herbs, and raw spices from partner farmers; technical training + catering/HORECA market access — growninnepal.com',
   array(select id from crops where name_en in ('Coffee', 'Tomato', 'Ginger')), null, null),
  ('Nepal Coffee Federation (NCF)', 'crop_buyer', null,
   'Umbrella federation, ~2,000 members incl. District Coffee Producers Associations; connects producers to international markets, supplies machine/parts/technical aid — coffeenepal.org.np, sanskriti.acharya@coffeenepal.org.np',
   array(select id from crops where name_en in ('Coffee')), null, null),
  -- --- user-provided, not independently re-verified by us ---
  ('Panchkhal Agro Group', 'input_supplier', (select id from districts where name = 'Kavrepalanchok'),
   'Kavre vegetable belt — six-company group distributing seeds, crop protection, and plant nutrition to local agrovets/cooperatives. (Not independently re-verified by us.)',
   null, null, null),
  ('NAFSCOL Krishiban Pvt. Ltd.', 'input_supplier', null,
   'Agroforestry setups, nursery materials, growth hormones, organic manures, rooftop farming setups. (Not independently re-verified by us.)',
   null, null, null),
  ('Shalom Agriculture', 'equipment_supplier', null,
   'Irrigation systems and structural farming tools from certified hardware brands. (Not independently re-verified by us.)',
   null, null, null),
  ('Thulo Marketplace', 'equipment_supplier', null,
   'Business directory of 110+ physical storefronts across Nepal selling farm machinery, feed, and plant bulbs — a directory, not a single seller. (Not independently re-verified by us.)',
   null, null, null),
  ('Machine Pasal', 'equipment_supplier', null,
   'Online catalog of food-processing plants, power tools, water pumps, and feed-milling machines. (Not independently re-verified by us.)',
   null, null, null),
  ('Krishihub Nepal', 'crop_buyer', null,
   'Buys 100% certified organic farm produce, distributed within 24 hours of harvest; also provides agritech training + supply logistics. (Not independently re-verified by us.)',
   null, null, null),
  ('Organic Venture Nepal', 'crop_buyer', null,
   'Buys buckwheat (Faper), cow ghee, and Timur from smallholder communities; provides organic-input and sustainability counseling. (Not independently re-verified by us.)',
   array(select id from crops where name_en in ('Buckwheat (Faper)', 'Milk (Dairy Products)')), null, null),
  ('Original Organic Farm', 'crop_buyer', null,
   'Structured maize/staple-crop buyback partnerships (e.g. with Belaka Municipality). (Not independently re-verified by us.)',
   array(select id from crops where name_en in ('Maize')), null, null),
  ('The Farm Shop KTM', 'crop_buyer', (select id from districts where name = 'Kathmandu'),
   'Buys artisanal cheeses, raw honey, organic vegetables, and specialty grains for fair-trade urban delivery. (Not independently re-verified by us.)',
   array(select id from crops where name_en in ('Milk (Dairy Products)', 'Honey (Beekeeping)')), null, null)
on conflict (business_name, vendor_type) do update set
  district_id = excluded.district_id,
  contact_info = excluded.contact_info,
  crops_bought = excluded.crops_bought,
  crops_supplied = excluded.crops_supplied,
  rating_avg = excluded.rating_avg;

-- No vendor_equipment rows: we couldn't verify which specific catalog item
-- any of these vendors actually stocks at what price — better to show
-- "no vendors listed yet" on a tool page than fabricate a price/product link
-- nobody has confirmed.

-- ============ CROP <-> EQUIPMENT LINKS ============
insert into crop_equipment (crop_id, equipment_id, notes)
select c.id, e.id, v.notes from (values
  ('Coffee', 'Solar Dryer (Post-Harvest)', 'Drying coffee cherries/parchment post-harvest.'),
  ('Coffee', 'Drip Irrigation Kit (per Ropani)', 'Irrigating young coffee plants during establishment.'),
  ('Coffee', 'IoT Soil-Moisture Sensor Kit', 'Managing soil moisture under shade-grown coffee.'),
  ('Rice', 'Mini-Tiller (Power Tiller, Walk-Behind)', 'Land preparation on small/terraced paddy plots.'),
  ('Rice', 'Agricultural Spraying Drone', 'Pest/fertilizer spraying over paddy fields.'),
  ('Maize', 'Mini-Tiller (Power Tiller, Walk-Behind)', 'Land preparation on hill maize plots.'),
  ('Wheat', 'Mini-Tiller (Power Tiller, Walk-Behind)', 'Land preparation after rice/maize harvest.'),
  ('Potato', 'Mini-Tiller (Power Tiller, Walk-Behind)', 'Land prep and ridging for potato beds.'),
  ('Potato', 'Drip Irrigation Kit (per Ropani)', 'Consistent moisture for tuber development.'),
  ('Tomato', 'Small Greenhouse / Polyhouse Kit', 'Season extension and protection from hail/erratic rain.'),
  ('Tomato', 'Drip Irrigation Kit (per Ropani)', 'Water-efficient irrigation for tunnel/polyhouse tomato.'),
  ('Cauliflower', 'Small Greenhouse / Polyhouse Kit', 'Nursery-stage protection before transplanting.'),
  ('Cabbage', 'Small Greenhouse / Polyhouse Kit', 'Nursery-stage protection before transplanting.'),
  ('Ginger', 'Solar Dryer (Post-Harvest)', 'Drying ginger for higher-value dried/powdered product.'),
  ('Chilli (Dry)', 'Solar Dryer (Post-Harvest)', 'Drying chilli for the dry/wholesale market.'),
  ('Turmeric', 'Solar Dryer (Post-Harvest)', 'Drying turmeric rhizomes before grinding.')
) as v(crop_name, equipment_name, notes)
join crops c on c.name_en = v.crop_name
join equipment e on e.name = v.equipment_name
on conflict (crop_id, equipment_id) do update set notes = excluded.notes;
