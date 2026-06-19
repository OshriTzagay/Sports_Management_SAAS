-- =============================================================================
-- בדיקת set_active_season: עונה פעילה אחת למועדון + בידוד בין מועדונים.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

-- שני מועדונים, לכל אחד שתי עונות
insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-st'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-st');
insert into public.seasons (id, club_id, name, is_active) values
  ('5a000000-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'A 24/25', true),
  ('5a000000-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 'A 25/26', false),
  ('5b000000-0000-0000-0000-000000000001', 'b2222222-2222-2222-2222-222222222222', 'B 24/25', true);

-- ---- כמשתמש של מועדון A: הפעלת העונה השנייה מכבה את הראשונה ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';

select public.set_active_season('5a000000-0000-0000-0000-000000000002');

reset role;
do $$
declare a constant uuid := 'a1111111-1111-1111-1111-111111111111';
begin
  assert (select count(*) from public.seasons where club_id = a and is_active) = 1, 'must have exactly one active season';
  assert (select is_active from public.seasons where id = '5a000000-0000-0000-0000-000000000002'), 'target season not active';
  assert not (select is_active from public.seasons where id = '5a000000-0000-0000-0000-000000000001'), 'previous season still active';
  raise notice 'PASS: exactly one active season after switch';
end $$;

-- ---- בידוד: משתמש מועדון A לא יכול להפעיל עונה של מועדון B ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';
do $$
declare blocked boolean := false;
begin
  begin
    perform public.set_active_season('5b000000-0000-0000-0000-000000000001');
  exception when others then
    blocked := true;
  end;
  assert blocked, 'FAIL: club A activated club B season';
  raise notice 'PASS: cannot activate another club season';
end $$;

reset role;
rollback;
