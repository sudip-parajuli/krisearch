-- Krisearch schema
-- Facts layer: zones, districts, crops, crop_zones, schemes, market_prices, equipment
-- Community layer: profiles, posts, tags, post_tags, comments, votes, reports, vendors, vendor_equipment

create extension if not exists "pgcrypto";

-- ============ FACTS LAYER ============

create table if not exists zones (
  id serial primary key,
  name text not null, -- Terai, Siwalik, Middle Hill, High Hill, Mountain, High Mountain
  altitude_min int,
  altitude_max int,
  description text
);

create table if not exists districts (
  id serial primary key,
  name text not null,
  province text not null,
  zone_id int references zones(id)
);

create table if not exists crops (
  id serial primary key,
  name_en text not null,
  name_np text,
  category text, -- cereal, vegetable, cash_crop, fruit, spice, livestock
  baseline_notes text -- short, non-authoritative starting info only
);

create table if not exists crop_zones (
  crop_id int references crops(id) on delete cascade,
  zone_id int references zones(id) on delete cascade,
  typical_planting_months text, -- e.g. "Jun-Jul" -- baseline, not gospel
  primary key (crop_id, zone_id)
);

create table if not exists schemes (
  id serial primary key,
  title text not null,
  description text,
  subsidy_type text,
  eligibility text,
  how_to_apply text,
  source_url text,
  last_verified date not null
);

create table if not exists market_prices (
  id serial primary key,
  crop_id int references crops(id) on delete cascade,
  market_name text,
  price_per_unit numeric,
  unit text,
  date_recorded date,
  source text
);

create table if not exists equipment (
  id serial primary key,
  name text not null,
  category text, -- drone, iot_sensor, irrigation, machinery, greenhouse, solar, post_harvest, digital_app
  description text,
  how_it_helps text,
  purchase_price_min numeric,
  purchase_price_max numeric,
  rental_price numeric,
  rental_price_unit text, -- e.g. "per acre spray", "per day", "per season"
  availability_status text, -- available_in_nepal, import_only, pilot_stage, service_only
  related_scheme_id int references schemes(id),
  source_url text,
  last_verified date not null
);

-- ============ COMMUNITY LAYER ============

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text default 'farmer', -- farmer, dealer, extension_officer, general
  district_id int references districts(id),
  verified_badge text, -- null, 'extension_officer', 'agrovet'
  crops_grown int[],
  bio text,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete set null,
  type text not null, -- question, disease_pest_report, fertilizer_tip, market_price_report, success_story, general_discussion, equipment_review
  crop_id int references crops(id),
  equipment_id int references equipment(id),
  district_id int references districts(id),
  title text not null,
  body text not null,
  image_urls text[],
  created_at timestamptz default now()
);

create table if not exists tags (
  id serial primary key,
  name text unique not null
);

create table if not exists post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id int references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  parent_comment_id uuid references comments(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  unique (user_id, post_id, comment_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reported_by uuid references profiles(id) on delete set null,
  reason text,
  status text default 'open', -- open, reviewed, dismissed
  created_at timestamptz default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  vendor_type text not null, -- crop_buyer, equipment_supplier, input_supplier, drone_service
  business_name text,
  crops_bought int[], -- used when vendor_type = crop_buyer
  district_id int references districts(id),
  contact_info text,
  rating_avg numeric default 0
);

create table if not exists vendor_equipment (
  vendor_id uuid references vendors(id) on delete cascade,
  equipment_id int references equipment(id) on delete cascade,
  offering_type text not null, -- sale, rental, service
  price numeric,
  price_unit text, -- e.g. "per acre", "one-time", "per season"
  primary key (vendor_id, equipment_id, offering_type)
);

-- Helpful indexes
create index if not exists idx_posts_crop on posts(crop_id);
create index if not exists idx_posts_equipment on posts(equipment_id);
create index if not exists idx_posts_district on posts(district_id);
create index if not exists idx_posts_type on posts(type);
create index if not exists idx_posts_created on posts(created_at desc);
create index if not exists idx_comments_post on comments(post_id);
create index if not exists idx_votes_post on votes(post_id);
create index if not exists idx_votes_comment on votes(comment_id);
create index if not exists idx_market_prices_crop on market_prices(crop_id);
create index if not exists idx_reports_status on reports(status);
