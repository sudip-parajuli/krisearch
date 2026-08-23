-- Row Level Security policies
-- Facts layer tables (zones, districts, crops, crop_zones, schemes, market_prices, equipment,
-- tags, vendors, vendor_equipment) are read-only reference/community-adjacent data: public read,
-- writes reserved for service role (admin tooling / seed scripts), so no user-write policies exist.

alter table zones enable row level security;
alter table districts enable row level security;
alter table crops enable row level security;
alter table crop_zones enable row level security;
alter table schemes enable row level security;
alter table market_prices enable row level security;
alter table equipment enable row level security;
alter table tags enable row level security;
alter table vendors enable row level security;
alter table vendor_equipment enable row level security;

create policy "public read zones" on zones for select using (true);
create policy "public read districts" on districts for select using (true);
create policy "public read crops" on crops for select using (true);
create policy "public read crop_zones" on crop_zones for select using (true);
create policy "public read schemes" on schemes for select using (true);
create policy "public read market_prices" on market_prices for select using (true);
create policy "public read equipment" on equipment for select using (true);
create policy "public read tags" on tags for select using (true);
create policy "public read vendors" on vendors for select using (true);
create policy "public read vendor_equipment" on vendor_equipment for select using (true);

-- authenticated users can propose new free-form tags
create policy "authenticated insert tags" on tags for insert to authenticated with check (true);

-- ============ COMMUNITY LAYER ============

alter table profiles enable row level security;
alter table posts enable row level security;
alter table post_tags enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;
alter table reports enable row level security;

-- profiles: everyone can read (needed for author display), users manage only their own row.
-- verified_badge is intentionally excluded from the user update policy's writable columns via
-- a trigger below, since column-level grants aren't expressible in a simple USING/CHECK policy.
create policy "public read profiles" on profiles for select using (true);
create policy "user insert own profile" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "user update own profile" on profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create or replace function prevent_self_verified_badge()
returns trigger as $$
begin
  if new.verified_badge is distinct from old.verified_badge
     and auth.role() <> 'service_role' then
    new.verified_badge := old.verified_badge;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_self_verified_badge on profiles;
create trigger trg_prevent_self_verified_badge
  before update on profiles
  for each row execute function prevent_self_verified_badge();

create policy "public read posts" on posts for select using (true);
create policy "user insert own posts" on posts for insert to authenticated with check (auth.uid() = author_id);
create policy "user update own posts" on posts for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "user delete own posts" on posts for delete to authenticated using (auth.uid() = author_id);

create policy "public read post_tags" on post_tags for select using (true);
create policy "authenticated insert post_tags" on post_tags for insert to authenticated with check (
  exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
);

create policy "public read comments" on comments for select using (true);
create policy "user insert own comments" on comments for insert to authenticated with check (auth.uid() = author_id);
create policy "user update own comments" on comments for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "user delete own comments" on comments for delete to authenticated using (auth.uid() = author_id);

create policy "public read votes" on votes for select using (true);
create policy "user insert own votes" on votes for insert to authenticated with check (auth.uid() = user_id);
create policy "user update own votes" on votes for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user delete own votes" on votes for delete to authenticated using (auth.uid() = user_id);

-- reports: authors can create and read their own reports; only service_role (admin) sees all
-- and updates status. Keeping report visibility private avoids tipping off reported users.
create policy "user insert own reports" on reports for insert to authenticated with check (auth.uid() = reported_by);
create policy "user read own reports" on reports for select to authenticated using (auth.uid() = reported_by);
