-- =============================================================================
-- players — שחקנים. ישות זהות קבועה: scope = club_id בלבד (כלל הברזל #2).
-- שחקן שעזב = status='left', לא נמחק (כלל הברזל #7).
-- =============================================================================
create table public.players (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references public.clubs (id) on delete cascade,
  first_name   text not null,
  last_name    text not null,
  national_id  text,
  birth_date   date,
  status       text not null default 'active' check (status in ('active', 'inactive', 'left')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index idx_players_club_id on public.players (club_id);
create unique index idx_players_unique_national_id
  on public.players (club_id, national_id)
  where national_id is not null and deleted_at is null;

create trigger trg_players_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();

alter table public.players enable row level security;

create policy players_select on public.players
  for select using (club_id = public.current_club_id());
create policy players_manage on public.players
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
