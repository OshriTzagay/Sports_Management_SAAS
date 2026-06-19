-- =============================================================================
-- בדיקת בידוד coaches בין מועדונים: קריאה + כתיבה.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-co'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-co');
insert into public.coaches (club_id, first_name, last_name) values
  ('a1111111-1111-1111-1111-111111111111', 'Gadi', 'Mor'),
  ('b2222222-2222-2222-2222-222222222222', 'Roni', 'Bar');

set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';

do $$
begin
  assert (select count(*) from public.coaches) = 1, 'club A must see only its own coach';
  assert (select count(*) from public.coaches where last_name = 'Bar') = 0, 'club A must not see club B coach';
  raise notice 'PASS: coaches read isolation';
end $$;

do $$
declare blocked boolean := false;
begin
  begin
    insert into public.coaches (club_id, first_name, last_name)
    values ('b2222222-2222-2222-2222-222222222222', 'Hijack', 'Coach');
  exception when others then
    blocked := true;
  end;
  assert blocked, 'FAIL: club A inserted a coach for club B';
  raise notice 'PASS: coaches write isolation';
end $$;

reset role;
rollback;
