-- Guest posting, AI fact-check signals, best-answer marking, feedback inbox,
-- and a global/Nepal split on the tools directory.

-- ============ PROFILES: guest support ============
alter table profiles add column if not exists contact_info text; -- optional phone/email a guest leaves for follow-up (not the verified auth identity)
alter table profiles add column if not exists is_guest boolean not null default false;

-- ============ POSTS / COMMENTS: AI fact-check signal ============
alter table posts add column if not exists ai_verdict text; -- 'safe' | 'caution' | 'danger' | 'unverified'
alter table posts add column if not exists ai_rationale text;
alter table posts add column if not exists ai_checked_at timestamptz;

alter table comments add column if not exists ai_verdict text;
alter table comments add column if not exists ai_rationale text;
alter table comments add column if not exists ai_checked_at timestamptz;
alter table comments add column if not exists is_best_answer boolean not null default false;

-- Only the AI-check route (using the service-role client) may set ai_* columns —
-- otherwise a user could forge their own "safe" verdict via a raw REST call.
-- RLS is row-level, not column-level, so this needs a trigger, not a policy.
create or replace function protect_ai_columns()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    if new.ai_verdict is distinct from old.ai_verdict
       or new.ai_rationale is distinct from old.ai_rationale
       or new.ai_checked_at is distinct from old.ai_checked_at then
      new.ai_verdict := old.ai_verdict;
      new.ai_rationale := old.ai_rationale;
      new.ai_checked_at := old.ai_checked_at;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_protect_ai_columns_posts on posts;
create trigger trg_protect_ai_columns_posts
  before update on posts
  for each row execute function protect_ai_columns();

drop trigger if exists trg_protect_ai_columns_comments on comments;
create trigger trg_protect_ai_columns_comments
  before update on comments
  for each row execute function protect_ai_columns();

-- A post's author may mark one comment on their own post as the best answer.
-- Note: this policy is row-level (like every RLS policy), so it technically
-- also lets the post author edit OTHER fields (e.g. body) of someone else's
-- comment via a hand-crafted API call — not just is_best_answer. Accepted as
-- a low-severity tradeoff (limited to the post's own author, on their own
-- post's comments) rather than adding column-level GRANTs for this MVP.
create policy "post author marks best answer" on comments for update to authenticated
  using (exists (select 1 from posts p where p.id = comments.post_id and p.author_id = auth.uid()))
  with check (exists (select 1 from posts p where p.id = comments.post_id and p.author_id = auth.uid()));

-- ============ EQUIPMENT: global vs. Nepal-available split ============
alter table equipment add column if not exists scope text not null default 'nepal'
  check (scope in ('nepal', 'global'));
comment on column equipment.scope is
  'nepal = tracked with real Nepal pricing/availability; global = emerging tech shown for awareness, not yet confirmed available in Nepal.';

-- ============ FEEDBACK: zero-friction, no login required ============
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  name text, -- optional
  contact text, -- optional phone/email
  message text not null,
  page_url text,
  status text not null default 'open', -- open, reviewed
  created_at timestamptz default now()
);

alter table feedback enable row level security;

-- Anyone can submit feedback, including fully unauthenticated visitors
-- (the `anon` role, not just signed-in `authenticated` users) — no account,
-- no anonymous session, nothing required.
create policy "anyone can submit feedback" on feedback for insert to anon, authenticated with check (true);
-- Deliberately no select policy: feedback is only readable via the
-- service-role client (admin view), not by any public/user role.
