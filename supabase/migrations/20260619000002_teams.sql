-- =============================================================================
-- teams — קבוצות. ישות עונתית: scope = club_id + season_id (כלל הברזל #2).
-- =============================================================================
create table public.teams (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references public.clubs (id) on delete cascade,
  season_id    uuid not null references public.seasons (id) on delete cascade,
  name         text not null,
  age_category text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index idx_teams_club_id on public.teams (club_id);
create index idx_teams_season_id on public.teams (season_id);
create unique index idx_teams_unique_name_per_season
  on public.teams (season_id, name)
  where deleted_at is null;

create trigger trg_teams_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

alter table public.teams enable row level security;

create policy teams_select on public.teams
  for select using (club_id = public.current_club_id());
create policy teams_manage on public.teams
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
