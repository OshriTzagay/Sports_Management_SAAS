-- =============================================================================
-- בדיקת set_club_status: happy path + audit + authorization (default-deny).
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug, status)
values ('66666666-6666-6666-6666-666666666666', 'Club Z', 'club-z', 'active');

-- ---- כמשתמש פלטפורמה: השעיה אמורה להצליח ולהיכתב ל-audit ----
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","sub":"99999999-9999-9999-9999-999999999999","app_metadata":{"is_platform":true}}';

select public.set_club_status('66666666-6666-6666-6666-666666666666', 'suspended');

reset role;
do $$
declare c constant uuid := '66666666-6666-6666-6666-666666666666';
begin
  assert (select status from public.clubs where id = c) = 'suspended', 'status not updated';
  assert (select count(*) from public.audit_logs
          where club_id = c and action = 'club.status_changed') = 1, 'audit not written';
  raise notice 'PASS: set_club_status updated status + wrote audit';
end $$;

-- ---- כמשתמש שאינו פלטפורמה: חייב להיחסם ----
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","app_metadata":{}}';
do $$
declare blocked boolean := false;
begin
  begin
    perform public.set_club_status('66666666-6666-6666-6666-666666666666', 'active');
  exception when others then
    blocked := true;
  end;
  assert blocked, 'FAIL: non-platform user changed club status';
  raise notice 'PASS: non-platform user is forbidden from changing status';
end $$;

reset role;
rollback;
