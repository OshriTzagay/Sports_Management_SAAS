-- =============================================================================
-- בדיקת team_players: בידוד בין מועדונים + שיבוץ יחיד לעונה.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-tp'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-tp');
insert into public.seasons (id, club_id, name, is_active) values
  ('51000000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', 'A 25/26', true);
insert into public.teams (id, club_id, season_id, name) values
  ('72000000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000a1', 'A-Team-1'),
  ('72000000-0000-0000-0000-0000000000a2', 'a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000a1', 'A-Team-2');
insert into public.players (id, club_id, first_name, last_name) values
  ('91000000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', 'Avi', 'Cohen');

-- ---- שיבוץ יחיד לעונה: השיבוץ השני נכשל על ה-unique (כל עוד הראשון פעיל) ----
insert into public.team_players (club_id, season_id, team_id, player_id) values
  ('a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000a1', '72000000-0000-0000-0000-0000000000a1', '91000000-0000-0000-0000-0000000000a1');

do $$
declare blocked boolean := false;
begin
  begin
    insert into public.team_players (club_id, season_id, team_id, player_id) values
      ('a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000a1', '72000000-0000-0000-0000-0000000000a2', '91000000-0000-0000-0000-0000000000a1');
  exception when others then
    blocked := true;
  end;
  assert blocked, 'FAIL: a player got two active assignments in one season';
  raise notice 'PASS: one active assignment per player per season';
end $$;

-- ---- בידוד: משתמש מועדון B לא רואה את השיבוץ של מועדון A ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"b2222222-2222-2222-2222-222222222222"}}';
do $$
begin
  assert (select count(*) from public.team_players) = 0, 'club B must not see club A assignments';
  raise notice 'PASS: team_players read isolation';
end $$;

reset role;
rollback;
