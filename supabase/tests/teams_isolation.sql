-- =============================================================================
-- בדיקת בידוד teams בין מועדונים: קריאה + כתיבה.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-tm'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-tm');
insert into public.seasons (id, club_id, name, is_active) values
  ('5a000000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', 'A 25/26', true),
  ('5b000000-0000-0000-0000-0000000000b1', 'b2222222-2222-2222-2222-222222222222', 'B 25/26', true);
insert into public.teams (club_id, season_id, name) values
  ('a1111111-1111-1111-1111-111111111111', '5a000000-0000-0000-0000-0000000000a1', 'A-Team'),
  ('b2222222-2222-2222-2222-222222222222', '5b000000-0000-0000-0000-0000000000b1', 'B-Team');

-- ---- כמשתמש של מועדון A ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';

do $$
begin
  assert (select count(*) from public.teams) = 1, 'club A must see only its own team';
  assert (select count(*) from public.teams where name = 'B-Team') = 0, 'club A must not see club B team';
  raise notice 'PASS: teams read isolation';
end $$;

do $$
declare blocked boolean := false;
begin
  begin
    insert into public.teams (club_id, season_id, name)
    values ('b2222222-2222-2222-2222-222222222222', '5b000000-0000-0000-0000-0000000000b1', 'hijack');
  exception when others then
    blocked := true;
  end;
  assert blocked, 'FAIL: club A inserted a team for club B';
  raise notice 'PASS: teams write isolation';
end $$;

reset role;
rollback;
