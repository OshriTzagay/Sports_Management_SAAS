-- =============================================================================
-- בדיקת בידוד players בין מועדונים: קריאה + כתיבה.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-pl'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-pl');
insert into public.players (club_id, first_name, last_name) values
  ('a1111111-1111-1111-1111-111111111111', 'Avi', 'Cohen'),
  ('b2222222-2222-2222-2222-222222222222', 'Beni', 'Levi');

-- ---- כמשתמש של מועדון A ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';

do $$
begin
  assert (select count(*) from public.players) = 1, 'club A must see only its own player';
  assert (select count(*) from public.players where last_name = 'Levi') = 0, 'club A must not see club B player';
  raise notice 'PASS: players read isolation';
end $$;

do $$
declare blocked boolean := false;
begin
  begin
    insert into public.players (club_id, first_name, last_name)
    values ('b2222222-2222-2222-2222-222222222222', 'Hijack', 'Player');
  exception when others then
    blocked := true;
  end;
  assert blocked, 'FAIL: club A inserted a player for club B';
  raise notice 'PASS: players write isolation';
end $$;

reset role;
rollback;
