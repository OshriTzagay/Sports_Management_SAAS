-- =============================================================================
-- בדיקת team_coaches: רב-ל-רב + מניעת כפילות + בידוד בין מועדונים.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-tc'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-tc');
insert into public.seasons (id, club_id, name, is_active) values
  ('51000000-0000-0000-0000-0000000000c1', 'a1111111-1111-1111-1111-111111111111', 'A 25/26', true);
insert into public.teams (id, club_id, season_id, name) values
  ('72000000-0000-0000-0000-0000000000c1', 'a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000c1', 'A-Team-1'),
  ('72000000-0000-0000-0000-0000000000c2', 'a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000c1', 'A-Team-2');
insert into public.coaches (id, club_id, first_name, last_name) values
  ('93000000-0000-0000-0000-0000000000c1', 'a1111111-1111-1111-1111-111111111111', 'Gadi', 'Mor');

-- מאמן אחד יכול לאמן שתי קבוצות (רב-ל-רב) — שתי השורות מצליחות
insert into public.team_coaches (club_id, season_id, team_id, coach_id, role) values
  ('a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000c1', '72000000-0000-0000-0000-0000000000c1', '93000000-0000-0000-0000-0000000000c1', 'head'),
  ('a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000c1', '72000000-0000-0000-0000-0000000000c2', '93000000-0000-0000-0000-0000000000c1', 'assistant');

do $$
begin
  assert (select count(*) from public.team_coaches where coach_id = '93000000-0000-0000-0000-0000000000c1') = 2,
    'a coach should be assignable to multiple teams';
  raise notice 'PASS: coach assigned to multiple teams';
end $$;

-- כפילות (אותו מאמן+קבוצה+עונה) נכשלת על ה-unique
do $$
declare blocked boolean := false;
begin
  begin
    insert into public.team_coaches (club_id, season_id, team_id, coach_id, role) values
      ('a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-0000000000c1', '72000000-0000-0000-0000-0000000000c1', '93000000-0000-0000-0000-0000000000c1', 'goalkeeping');
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: duplicate coach assignment allowed';
  raise notice 'PASS: duplicate assignment blocked';
end $$;

-- בידוד: מועדון B לא רואה שיוכי מועדון A
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"b2222222-2222-2222-2222-222222222222"}}';
do $$
begin
  assert (select count(*) from public.team_coaches) = 0, 'club B must not see club A assignments';
  raise notice 'PASS: team_coaches read isolation';
end $$;

reset role;
rollback;
