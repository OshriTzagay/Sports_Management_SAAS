-- =============================================================================
-- בדיקת provision_club: happy path + authorization (default-deny).
-- טרנזקציונלי + rollback — לא משאיר נתונים.
-- הרצה:  psql "<connection>" -v ON_ERROR_STOP=1 -f supabase/tests/provision_club.sql
-- =============================================================================
\set ON_ERROR_STOP on
begin;

-- משתמש אימות מזויף עבור מנהל המועדון (יעד ה-FK של public.users)
insert into auth.users (id, email)
values ('33333333-3333-3333-3333-333333333333', 'admin@club-x.test');

-- ---- כמשתמש פלטפורמה: ההקמה אמורה להצליח וליצור את כל הרשומות ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","sub":"99999999-9999-9999-9999-999999999999","app_metadata":{"is_platform":true}}';

select public.provision_club(
  '44444444-4444-4444-4444-444444444444', 'Club X', 'club-x',
  '33333333-3333-3333-3333-333333333333', 'admin@club-x.test', 'Admin X', '2025/26'
);

-- אימות הרשומות כ-superuser (RLS עקוף) — המשתמש הפלטפורמה עצמו אינו רואה
-- טבלאות tenant דרך RLS כי אין לו club_id ב-claim (וזה תקין).
reset role;
do $$
declare c constant uuid := '44444444-4444-4444-4444-444444444444';
begin
  assert (select count(*) from public.clubs where id = c) = 1, 'club not created';
  assert (select count(*) from public.roles where club_id = c and is_system) = 1, 'system role not created';
  assert (select count(*) from public.role_permissions where club_id = c)
       = (select count(*) from public.permissions), 'permissions not fully assigned';
  assert (select count(*) from public.users where club_id = c) = 1, 'admin user not created';
  assert (select count(*) from public.seasons where club_id = c and is_active) = 1, 'active season not created';
  assert (select count(*) from public.audit_logs where club_id = c and action = 'club.provisioned') = 1, 'audit not written';
  raise notice 'PASS: provision_club created club + role + permissions + admin + season + audit';
end $$;

-- ---- כמשתמש שאינו פלטפורמה: ההקמה חייבת להיחסם (default-deny) ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"44444444-4444-4444-4444-444444444444"}}';

do $$
declare blocked boolean := false;
begin
  begin
    perform public.provision_club(
      '55555555-5555-5555-5555-555555555555', 'Club Y', 'club-y',
      '33333333-3333-3333-3333-333333333333', 'y@club-y.test', 'Admin Y', '2025/26'
    );
  exception when others then
    blocked := true;
  end;
  assert blocked, 'FAIL: non-platform user managed to provision a club';
  raise notice 'PASS: non-platform user is forbidden from provisioning';
end $$;

reset role;
rollback;
