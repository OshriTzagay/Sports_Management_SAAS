-- =============================================================================
-- team_players — שיבוץ שחקן↔קבוצה. שיוך עונתי: scope = club_id + season_id.
-- מפריד את הזהות (players) מהשיוך — מאפשר היסטוריה וגלגול עונה (כלל הברזל #2).
-- שחקן משובץ לקבוצה אחת לכל היותר בכל עונה.
-- =============================================================================
create table public.team_players (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs (id) on delete cascade,
  season_id   uuid not null references public.seasons (id) on delete cascade,
  team_id     uuid not null references public.teams (id) on delete cascade,
  player_id   uuid not null references public.players (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index idx_team_players_club_id on public.team_players (club_id);
create index idx_team_players_season_id on public.team_players (season_id);
create index idx_team_players_team_id on public.team_players (team_id);
create index idx_team_players_player_id on public.team_players (player_id);
create unique index idx_team_players_one_team_per_season
  on public.team_players (season_id, player_id)
  where deleted_at is null;

create trigger trg_team_players_updated_at
  before update on public.team_players
  for each row execute function public.set_updated_at();

alter table public.team_players enable row level security;

create policy team_players_select on public.team_players
  for select using (club_id = public.current_club_id());
create policy team_players_manage on public.team_players
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
