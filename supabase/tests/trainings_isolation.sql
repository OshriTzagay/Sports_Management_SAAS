-- =============================================================================
-- בדיקת training_sessions / training_attendance: בידוד בין מועדונים + נוכחות יחידה.
-- אזור רגיש (בסיס לתשלום למאמן) → בידוד חובה. טרנזקציוני + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-tr'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-tr');

insert into public.seasons (id, club_id, name, is_active, status) values
  ('50000000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', '25/26', true, 'active'),
  ('50000000-0000-0000-0000-0000000000b1', 'b2222222-2222-2222-2222-222222222222', '25/26', true, 'active');
insert into public.teams (id, club_id, season_id, name) values
  ('7ea70000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', '50000000-0000-0000-0000-0000000000a1', 'Team A'),
  ('7ea70000-0000-0000-0000-0000000000b1', 'b2222222-2222-2222-2222-222222222222', '50000000-0000-0000-0000-0000000000b1', 'Team B');
insert into public.coaches (id, club_id, first_name, last_name) values
  ('c0ac0000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', 'Coach', 'A'),
  ('c0ac0000-0000-0000-0000-0000000000b1', 'b2222222-2222-2222-2222-222222222222', 'Coach', 'B');
insert into public.players (id, club_id, first_name, last_name) values
  ('91a00000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', 'Kid', 'A');

insert into public.training_sessions (id, club_id, season_id, team_id, coach_id, status) values
  ('7a1a0000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111',
   '50000000-0000-0000-0000-0000000000a1', '7ea70000-0000-0000-0000-0000000000a1',
   'c0ac0000-0000-0000-0000-0000000000a1', 'in_progress');
insert into public.training_attendance (club_id, training_session_id, player_id, status) values
  ('a1111111-1111-1111-1111-111111111111', '7a1a0000-0000-0000-0000-0000000000a1',
   '91a00000-0000-0000-0000-0000000000a1', 'present');

-- נוכחות יחידה לכל שחקן באימון: שורה שנייה נכשלת
do $$
declare blocked boolean := false;
begin
  begin
    insert into public.training_attendance (club_id, training_session_id, player_id, status) values
      ('a1111111-1111-1111-1111-111111111111', '7a1a0000-0000-0000-0000-0000000000a1',
       '91a00000-0000-0000-0000-0000000000a1', 'absent');
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: duplicate attendance row for same player+session';
  raise notice 'PASS: one attendance row per player per session';
end $$;

-- בידוד: משתמש מועדון A רואה רק את האימונים שלו
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';
do $$
begin
  assert (select count(*) from public.training_sessions) = 1, 'club A should see its 1 session';
  assert (select count(*) from public.training_attendance) = 1, 'club A should see its 1 attendance';
  raise notice 'PASS: club A sees only its own trainings';
end $$;

-- בידוד כתיבה: מועדון B לא יכול לכתוב אימון למועדון A
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"b2222222-2222-2222-2222-222222222222"}}';
do $$
declare blocked boolean := false;
begin
  assert (select count(*) from public.training_sessions) = 0, 'club B should see no sessions';
  begin
    insert into public.training_sessions (club_id, season_id, team_id, coach_id) values
      ('a1111111-1111-1111-1111-111111111111', '50000000-0000-0000-0000-0000000000a1',
       '7ea70000-0000-0000-0000-0000000000a1', 'c0ac0000-0000-0000-0000-0000000000a1');
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: club B wrote a session into club A';
  raise notice 'PASS: club B cannot write into club A';
end $$;

rollback;
