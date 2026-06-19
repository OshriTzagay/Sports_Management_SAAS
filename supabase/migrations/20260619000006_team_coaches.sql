-- =============================================================================
-- team_coaches — שיוך מאמן↔קבוצה. שיוך עונתי: scope = club_id + season_id.
-- רב-ל-רב: מאמן יכול לאמן כמה קבוצות, וקבוצה יכולה להיות עם כמה מאמנים.
-- role: ראשי / עוזר / מאמן שוערים.
-- =============================================================================
create table public.team_coaches (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs (id) on delete cascade,
  season_id   uuid not null references public.seasons (id) on delete cascade,
  team_id     uuid not null references public.teams (id) on delete cascade,
  coach_id    uuid not null references public.coaches (id) on delete cascade,
  role        text not null default 'head' check (role in ('head', 'assistant', 'goalkeeping')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index idx_team_coaches_club_id on public.team_coaches (club_id);
create index idx_team_coaches_season_id on public.team_coaches (season_id);
create index idx_team_coaches_team_id on public.team_coaches (team_id);
create index idx_team_coaches_coach_id on public.team_coaches (coach_id);
create unique index idx_team_coaches_unique_assignment
  on public.team_coaches (season_id, team_id, coach_id)
  where deleted_at is null;

create trigger trg_team_coaches_updated_at
  before update on public.team_coaches
  for each row execute function public.set_updated_at();

alter table public.team_coaches enable row level security;

create policy team_coaches_select on public.team_coaches
  for select using (club_id = public.current_club_id());
create policy team_coaches_manage on public.team_coaches
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
