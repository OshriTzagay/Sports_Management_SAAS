-- =============================================================================
-- coaches — מאמנים. ישות זהות קבועה: scope = club_id בלבד (כלל הברזל #2).
-- כולל הסמכות ותוקף רישיון אימון.
-- =============================================================================
create table public.coaches (
  id             uuid primary key default gen_random_uuid(),
  club_id        uuid not null references public.clubs (id) on delete cascade,
  first_name     text not null,
  last_name      text not null,
  phone          text,
  certification  text,
  license_expiry date,
  status         text not null default 'active' check (status in ('active', 'inactive')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index idx_coaches_club_id on public.coaches (club_id);

create trigger trg_coaches_updated_at
  before update on public.coaches
  for each row execute function public.set_updated_at();

alter table public.coaches enable row level security;

create policy coaches_select on public.coaches
  for select using (club_id = public.current_club_id());
create policy coaches_manage on public.coaches
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
