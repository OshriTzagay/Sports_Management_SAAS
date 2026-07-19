-- =============================================================================
-- אימונים (trainings) — Phase למאמנים. בסיס לתשלום למאמן, לכן מדויק ומלא.
--   training_sessions  — אימון של קבוצה בעונה, שמנוהל ע"י מאמן (scheduled→
--                        in_progress→completed). start/end → משך/שעות.
--   training_attendance — נוכחות שחקן לאימון (present/absent). snapshot בהתחלה.
-- הרשאות: trainings.view / trainings.manage. מפות תפקיד מתעדכנות.
-- =============================================================================

-- 1) קטלוג הרשאות
insert into public.permissions (key, description) values
  ('trainings.view',   'צפייה באימונים ונוכחות'),
  ('trainings.manage', 'יצירה/ניהול אימונים ונוכחות')
on conflict (key) do nothing;

-- 2) עדכון ensure_system_roles — גזבר/ית מקבל trainings.view, מאמן view+manage,
--    Owner אוטומטית (כל ההרשאות).
create or replace function public.ensure_system_roles(p_club_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id     uuid;
  v_treasurer_id uuid;
  v_coach_id     uuid;
begin
  insert into public.roles (club_id, name, is_system)
  values (p_club_id, 'מנהל מועדון', true)
  on conflict (club_id, name) do nothing;
  select id into v_owner_id
    from public.roles where club_id = p_club_id and name = 'מנהל מועדון';
  insert into public.role_permissions (club_id, role_id, permission_id)
  select p_club_id, v_owner_id, id from public.permissions
  on conflict (role_id, permission_id) do nothing;

  insert into public.roles (club_id, name, is_system)
  values (p_club_id, 'גזבר/ית', true)
  on conflict (club_id, name) do nothing;
  select id into v_treasurer_id
    from public.roles where club_id = p_club_id and name = 'גזבר/ית';
  insert into public.role_permissions (club_id, role_id, permission_id)
  select p_club_id, v_treasurer_id, id from public.permissions
  where key in (
    'seasons.view', 'teams.view', 'players.view', 'coaches.view',
    'contacts.view', 'contacts.manage',
    'payments.view', 'payments.charge', 'reports.view',
    'trainings.view'
  )
  on conflict (role_id, permission_id) do nothing;

  insert into public.roles (club_id, name, is_system)
  values (p_club_id, 'מאמן', true)
  on conflict (club_id, name) do nothing;
  select id into v_coach_id
    from public.roles where club_id = p_club_id and name = 'מאמן';
  insert into public.role_permissions (club_id, role_id, permission_id)
  select p_club_id, v_coach_id, id from public.permissions
  where key in (
    'seasons.view', 'teams.view', 'players.view', 'coaches.view',
    'contacts.view',
    'trainings.view', 'trainings.manage'
  )
  on conflict (role_id, permission_id) do nothing;
end;
$$;

revoke all on function public.ensure_system_roles(uuid) from public, anon, authenticated;

-- 3) טבלת אימונים
create table public.training_sessions (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid not null references public.clubs (id) on delete cascade,
  season_id     uuid not null references public.seasons (id) on delete cascade,
  team_id       uuid not null references public.teams (id) on delete cascade,
  coach_id      uuid not null references public.coaches (id) on delete cascade,
  title         text,
  scheduled_at  timestamptz not null default now(),
  status        text not null default 'scheduled'
                  check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  started_at    timestamptz,
  ended_at      timestamptz,
  notes         text,
  created_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_training_sessions_club_id on public.training_sessions (club_id);
create index idx_training_sessions_season_id on public.training_sessions (season_id);
create index idx_training_sessions_team_id on public.training_sessions (team_id);
create index idx_training_sessions_coach_id on public.training_sessions (coach_id);

create trigger trg_training_sessions_updated_at
  before update on public.training_sessions
  for each row execute function public.set_updated_at();

alter table public.training_sessions enable row level security;

create policy training_sessions_select on public.training_sessions
  for select using (club_id = public.current_club_id());
create policy training_sessions_manage on public.training_sessions
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- 4) טבלת נוכחות
create table public.training_attendance (
  id                  uuid primary key default gen_random_uuid(),
  club_id             uuid not null references public.clubs (id) on delete cascade,
  training_session_id uuid not null references public.training_sessions (id) on delete cascade,
  player_id           uuid not null references public.players (id) on delete cascade,
  status              text not null default 'present'
                        check (status in ('present', 'absent')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (training_session_id, player_id)
);

create index idx_training_attendance_club_id on public.training_attendance (club_id);
create index idx_training_attendance_session on public.training_attendance (training_session_id);

create trigger trg_training_attendance_updated_at
  before update on public.training_attendance
  for each row execute function public.set_updated_at();

alter table public.training_attendance enable row level security;

create policy training_attendance_select on public.training_attendance
  for select using (club_id = public.current_club_id());
create policy training_attendance_manage on public.training_attendance
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- 5) Backfill — הזרעת ההרשאות החדשות לכל המועדונים הקיימים.
select public.ensure_system_roles(id) from public.clubs;
