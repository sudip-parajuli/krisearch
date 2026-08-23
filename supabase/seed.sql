-- Krisearch seed data
-- This is illustrative starter data for local development, not a verified production dataset.
-- Before launch: re-verify scheme details/URLs, refresh market_prices, and confirm equipment
-- prices and availability_status with real vendors. last_verified dates below mark when this
-- seed file was written, not when the underlying fact was actually confirmed in the field.

-- ============ ZONES ============
insert into zones (name, altitude_min, altitude_max, description) values
  ('Terai', 60, 300, 'Flat plains along the southern border; Nepal''s main grain belt.'),
  ('Siwalik', 300, 1500, 'Low outer foothills (Chure range); fragile soils, mixed farming.'),
  ('Middle Hill', 700, 2000, 'Densely settled hill terraces; the classic smallholder heartland.'),
  ('High Hill', 2000, 3000, 'Higher hill terraces; shorter growing season, more livestock reliance.'),
  ('Mountain', 3000, 4000, 'High Himalayan valleys; limited arable land, short summer cropping.'),
  ('High Mountain', 4000, 5500, 'Trans-Himalayan/alpine; minimal cropping, mostly pastoral.')
on conflict do nothing;

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
on conflict do nothing;

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
  ('Mustard', 'तोरी', 'cash_crop', 'Major winter oilseed, grown widely across Terai and mid-hills.'),
  ('Lentil (Musuro)', 'मुसुरो', 'cash_crop', 'Nepal is a major global lentil exporter; grown post-rice in Terai.'),
  ('Chickpea (Chana)', 'चना', 'cash_crop', 'Winter legume, mostly Terai; improves soil nitrogen.'),
  ('Sugarcane', 'उखु', 'cash_crop', 'Terai cash crop tied to local sugar mill contracts.'),
  ('Ginger', 'अदुवा', 'spice', 'High-value hill cash crop; Nepal is among the world''s top producers.'),
  ('Cardamom (Large)', 'अलैंची', 'spice', 'Major eastern hill export crop, grown under forest shade.'),
  ('Tea', 'चिया', 'cash_crop', 'Concentrated in Ilam, Jhapa, Panchthar; orthodox and CTC production.'),
  ('Apple', 'स्याउ', 'fruit', 'High-hill/mountain fruit crop, especially Mustang, Jumla, and nearby districts.'),
  ('Citrus (Junar/Orange)', 'सुन्तला', 'fruit', 'Mid-hill fruit crop, vulnerable to citrus greening disease.'),
  ('Buffalo (Dairy)', 'भैंसी', 'livestock', 'Primary dairy animal for most smallholder households.'),
  ('Goat', 'बाख्रा', 'livestock', 'Widespread smallholder livestock, important for cash income and meat.')
on conflict do nothing;

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
on conflict do nothing;

-- ============ SCHEMES (illustrative examples — verify before relying on these) ============
insert into schemes (title, description, subsidy_type, eligibility, how_to_apply, source_url, last_verified) values
  (
    'Agricultural Equipment Subsidy (illustrative example)',
    'Example placeholder describing a partial subsidy on approved farm machinery purchases, disbursed through provincial agriculture offices. Replace with the current, verified scheme text before launch.',
    'equipment_purchase_subsidy',
    'Registered smallholder farmers/farmer groups within the applicable province.',
    'Apply through your local Provincial/District Agriculture Knowledge Center (Krishi Gyan Kendra) with land ownership and citizenship documents.',
    'https://moald.gov.np',
    '2026-01-15'
  ),
  (
    'Youth-Targeted Agri-Entrepreneurship Loan (illustrative example)',
    'Example placeholder for a concessional-interest loan program aimed at youth starting commercial farming ventures. Replace with the current, verified scheme text before launch.',
    'concessional_loan',
    'Applicants aged 18-40 with a farm business plan, per current program rules.',
    'Apply via a partner bank branch with your business plan and citizenship documents.',
    'https://moald.gov.np',
    '2026-02-01'
  )
on conflict do nothing;

-- ============ EQUIPMENT ============
insert into equipment (name, category, description, how_it_helps, purchase_price_min, purchase_price_max, rental_price, rental_price_unit, availability_status, related_scheme_id, source_url, last_verified) values
  (
    'Agricultural Spraying Drone',
    'drone',
    'Multirotor drone fitted with a tank and nozzles for pesticide/fertilizer spraying.',
    'Cuts spraying time and chemical exposure sharply versus manual knapsack spraying; most useful on medium-to-larger or pooled plots.',
    700000, 900000, 1500, 'per acre spray',
    'service_only',
    1,
    null,
    '2026-06-01'
  ),
  (
    'Mini-Tiller (Power Tiller, Walk-Behind)',
    'machinery',
    'Small walk-behind tiller sized for terraced and fragmented hill/Terai plots.',
    'Right-sized mechanization for plots too small or steep for a full tractor; cuts land-prep labor and time.',
    120000, 220000, 1500, 'per day',
    'available_in_nepal',
    1,
    null,
    '2026-05-10'
  ),
  (
    'Solar Irrigation Pump',
    'solar',
    'Solar-powered water pump for lifting irrigation water without grid electricity or diesel.',
    'Removes recurring diesel cost and gives off-grid plots reliable irrigation access.',
    150000, 350000, null, null,
    'available_in_nepal',
    null,
    null,
    '2026-04-20'
  ),
  (
    'Drip Irrigation Kit (per Ropani)',
    'irrigation',
    'Tubing, emitters, and filter kit sized for small-plot drip irrigation.',
    'Cuts water use substantially versus flood irrigation and improves yield consistency for vegetables.',
    8000, 25000, null, null,
    'available_in_nepal',
    null,
    null,
    '2026-04-20'
  ),
  (
    'IoT Soil-Moisture Sensor Kit',
    'iot_sensor',
    'Wireless soil-moisture/temperature sensors with a phone-app dashboard.',
    'Tells farmers when a plot actually needs water instead of guessing, saving both water and pump-running cost.',
    15000, 45000, null, null,
    'pilot_stage',
    null,
    null,
    '2026-03-15'
  ),
  (
    'Small Greenhouse / Polyhouse Kit',
    'greenhouse',
    'Bamboo or steel-frame polyhouse kit sized for small vegetable plots (roughly 20x8 m).',
    'Extends the growing season and protects high-value vegetables (tomato, cucumber, capsicum) from hail and erratic rain.',
    60000, 180000, null, null,
    'available_in_nepal',
    1,
    null,
    '2026-05-01'
  ),
  (
    'Solar Dryer (Post-Harvest)',
    'post_harvest',
    'Solar-powered dehydration unit for grains, spices, and fruit.',
    'Reduces post-harvest spoilage and lets farmers sell dried/higher-value product instead of raw perishables.',
    30000, 90000, null, null,
    'pilot_stage',
    null,
    null,
    '2026-02-10'
  ),
  (
    'Farm Management Mobile App',
    'digital_app',
    'Smartphone app for tracking planting dates, expenses, and reminders.',
    'Helps farmers plan input timing and keep basic records without paper bookkeeping.',
    0, 0, null, null,
    'available_in_nepal',
    null,
    null,
    '2026-06-15'
  )
on conflict do nothing;

-- ============ SAMPLE MARKET PRICES (illustrative) ============
insert into market_prices (crop_id, market_name, price_per_unit, unit, date_recorded, source)
select c.id, v.market, v.price, v.unit, v.d::date, v.source from (values
  ('Rice', 'Kalimati, Kathmandu', 65, 'per kg', '2026-08-10', 'illustrative sample'),
  ('Rice', 'Kalimati, Kathmandu', 68, 'per kg', '2026-08-17', 'illustrative sample'),
  ('Tomato', 'Kalimati, Kathmandu', 55, 'per kg', '2026-08-10', 'illustrative sample'),
  ('Tomato', 'Kalimati, Kathmandu', 40, 'per kg', '2026-08-17', 'illustrative sample'),
  ('Potato', 'Kalimati, Kathmandu', 45, 'per kg', '2026-08-10', 'illustrative sample'),
  ('Potato', 'Kalimati, Kathmandu', 48, 'per kg', '2026-08-17', 'illustrative sample')
) as v(crop_name, market, price, unit, d, source)
join crops c on c.name_en = v.crop_name
on conflict do nothing;
