-- Schema for: weather (district coordinates), verified-badge self-service
-- applications, group-buy pledges, and a public changelog for feedback.

-- ============ WEATHER ============
alter table districts add column if not exists latitude numeric;
alter table districts add column if not exists longitude numeric;
comment on column districts.latitude is 'District HQ approx. coordinates — general guidance for district-level weather, not precise for every village.';

-- ============ VERIFIED BADGE APPLICATIONS ============
create table if not exists verification_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  requested_badge text not null, -- 'extension_officer' | 'agrovet'
  evidence_text text,
  evidence_url text,
  status text not null default 'pending', -- pending, approved, rejected
  created_at timestamptz default now()
);

alter table verification_requests enable row level security;
create policy "user insert own verification request" on verification_requests
  for insert to authenticated with check (auth.uid() = profile_id);
create policy "user read own verification request" on verification_requests
  for select to authenticated using (auth.uid() = profile_id);
-- Deliberately no public/authenticated update policy — only the service-role
-- client (used from /admin) can change status or grant the badge.

-- ============ GROUP-BUY PLEDGES ============
-- A post of type 'group_buy' represents a pooled-order proposal; a pledge is
-- someone saying "count me in" with an optional free-text note (quantity,
-- contact preference, etc.) rather than a structured order system.
create table if not exists group_buy_pledges (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  note text,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table group_buy_pledges enable row level security;
create policy "public read pledges" on group_buy_pledges for select using (true);
create policy "user insert own pledge" on group_buy_pledges for insert to authenticated with check (auth.uid() = user_id);
create policy "user delete own pledge" on group_buy_pledges for delete to authenticated using (auth.uid() = user_id);

-- ============ PUBLIC CHANGELOG ============
-- A short note admins can attach when resolving feedback, shown on a public
-- /changelog page — closes the loop so farmers can see their input mattered.
alter table feedback add column if not exists resolution_note text;
