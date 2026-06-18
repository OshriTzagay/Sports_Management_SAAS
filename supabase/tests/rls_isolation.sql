-- =============================================================================
-- בדיקת בידוד RLS בין מועדונים (כלל הברזל #1).
-- מוודאת שמשתמש ממועדון א' לא רואה ולא כותב נתוני מועדון ב'.
-- טרנזקציונלי + rollback — לא משאיר נתונים ב-DB.
-- הרצה:  psql "<connection>" -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.sql
-- =============================================================================
\set ON_ERROR_STOP on
begin;

-- ---- Setup (כ-owner/superuser — RLS עקוף) ----
insert into public.clubs (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Club A', 'club-a'),
  ('22222222-2222-2222-2222-222222222222', 'Club B', 'club-b');
insert into public.seasons (club_id, name) values
  ('11111111-1111-1111-1111-111111111111', 'A 2025/26'),
  ('22222222-2222-2222-2222-222222222222', 'B 2025/26');

-- ---- כמשתמש מאומת של מועדון A ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"11111111-1111-1111-1111-111111111111"}}';

-- קריאה: רואה רק את העונה של מועדון A
do $$
begin
  assert (select count(*) from public.seasons) = 1,
    'FAIL: club A should see exactly 1 season (its own)';
  assert (select count(*) from public.seasons
          where club_id = '22222222-2222-2222-2222-222222222222') = 0,
    'FAIL: club A must NOT see club B data';
  raise notice 'PASS: read isolation — club A sees only its own season';
end $$;

-- כתיבה: ניסיון ליצור עונה למועדון אחר חייב להיכשל (WITH CHECK)
do $$
declare blocked boolean := false;
begin
  begin
    insert into public.seasons (club_id, name)
    values ('22222222-2222-2222-2222-222222222222', 'hijack attempt');
  exception when others then
    blocked := true;
  end;
  assert blocked, 'FAIL: club A managed to write a season for club B';
  raise notice 'PASS: write isolation — club A cannot insert into club B';
end $$;

reset role;
rollback;
