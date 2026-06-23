-- =============================================================================
-- בדיקת בידוד club_branding בין מועדונים: קריאה + כתיבה.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-br'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-br');
insert into public.club_branding (club_id, display_name, primary_color) values
  ('a1111111-1111-1111-1111-111111111111', 'A FC', '#123456'),
  ('b2222222-2222-2222-2222-222222222222', 'B FC', '#654321');

set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';

do $$
begin
  assert (select count(*) from public.club_branding) = 1, 'club A must see only its own branding';
  assert (select display_name from public.club_branding) = 'A FC', 'club A sees the wrong branding';
  raise notice 'PASS: branding read isolation';
end $$;

-- ניסיון לשנות branding של מועדון אחר — RLS מסנן את השורה, ה-update הוא no-op.
update public.club_branding set display_name = 'hacked'
where club_id = 'b2222222-2222-2222-2222-222222222222';

reset role;
-- אימות כ-superuser שמועדון B לא שונה
do $$
begin
  assert (select display_name from public.club_branding
          where club_id = 'b2222222-2222-2222-2222-222222222222') = 'B FC',
    'FAIL: club B branding was modified by club A';
  raise notice 'PASS: club B branding untouched';
end $$;

rollback;
