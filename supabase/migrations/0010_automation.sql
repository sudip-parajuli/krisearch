-- Additive automation infrastructure. Existing user content is not rewritten.
begin;
-- Preserve commodity varieties and units instead of overwriting the first
-- source row mapped to each crop. Existing rows are retained.
alter table public.market_prices drop constraint if exists market_prices_crop_market_date_key;
alter table public.market_prices add constraint market_prices_source_date_key
  unique (crop_id,market_name,date_recorded,source,unit);
create table if not exists public.automation_sources (
  id text primary key,
  label text not null,
  kind text not null check (kind in ('notice','scheme','vendor','tool')),
  url text not null check (url like 'https://%'),
  format text not null default 'html_links' check (format in ('html_links','rss','json')),
  enabled boolean not null default true,
  auto_publish boolean not null default false,
  checked_at timestamptz,
  last_success_at timestamptz,
  last_error text
);
create table if not exists public.automation_items (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.automation_sources(id) on delete cascade,
  external_key text not null,
  kind text not null check (kind in ('notice','scheme','vendor','tool')),
  title text not null,
  url text not null,
  summary text,
  payload jsonb not null default '{}',
  state text not null default 'pending' check (state in ('pending','published','ignored')),
  target_id text,
  checked_at timestamptz not null default now(),
  published_at timestamptz,
  unique(source_id, external_key)
);
create index if not exists automation_items_state_date on public.automation_items(state, checked_at desc);
create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running','success','partial','failed')),
  details jsonb not null default '{}'
);
create table if not exists public.automation_locks (key text primary key, expires_at timestamptz not null);
create table if not exists public.automation_usage (key text primary key, expires_at timestamptz not null, count int not null default 0);
create table if not exists public.ai_answers (
  post_id uuid primary key references public.posts(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','answered','failed')),
  answer text,
  citations jsonb not null default '[]',
  language text not null default 'ne' check (language in ('ne','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  error text,
  version text
);
alter table public.automation_sources enable row level security;
alter table public.automation_items enable row level security;
alter table public.automation_runs enable row level security;
alter table public.automation_locks enable row level security;
alter table public.automation_usage enable row level security;
alter table public.ai_answers enable row level security;
revoke all on public.automation_sources, public.automation_items, public.automation_runs, public.automation_locks, public.automation_usage, public.ai_answers from anon, authenticated;
grant select on public.automation_items, public.ai_answers to anon, authenticated;
grant all on public.automation_sources, public.automation_items, public.automation_runs, public.automation_locks, public.automation_usage, public.ai_answers to service_role;
create policy "published source updates" on public.automation_items for select to anon, authenticated using (state = 'published');
create policy "published AI answers" on public.ai_answers for select to anon, authenticated using (status = 'answered');

create or replace function public.claim_automation_lock(p_key text, p_seconds int default 90)
returns boolean language sql security definer set search_path = '' as $$
  with claimed as (
    insert into public.automation_locks as l(key, expires_at)
    values (p_key, now() + make_interval(secs => least(greatest(p_seconds, 10), 600)))
    on conflict(key) do update set expires_at = excluded.expires_at where l.expires_at < now()
    returning key
  ) select exists(select 1 from claimed);
$$;
create or replace function public.consume_automation_budget(p_key text, p_limit int, p_seconds int default 86400)
returns boolean language sql security definer set search_path = '' as $$
  with accepted as (
    insert into public.automation_usage as u(key, expires_at, count)
    values (p_key, now() + make_interval(secs => p_seconds), 1)
    on conflict(key) do update set
      count = case when u.expires_at < now() then 1 else u.count + 1 end,
      expires_at = case when u.expires_at < now() then excluded.expires_at else u.expires_at end
    where u.expires_at < now() or u.count < p_limit
    returning key
  ) select exists(select 1 from accepted);
$$;
revoke all on function public.claim_automation_lock(text,int), public.consume_automation_budget(text,int,int) from public, anon, authenticated;
grant execute on function public.claim_automation_lock(text,int), public.consume_automation_budget(text,int,int) to service_role;

insert into public.automation_sources(id,label,kind,url,format,auto_publish) values
('doa-notices','Department of Agriculture, Nepal','notice','https://doanepal.gov.np/ne/','html_links',true)
on conflict(id) do nothing;
commit;
