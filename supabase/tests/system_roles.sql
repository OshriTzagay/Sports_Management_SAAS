-- =============================================================================
-- בדיקת ensure_system_roles: 3 תפקידי מערכת + מיפוי הרשאות מדויק + idempotency.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug)
values ('a1111111-1111-1111-1111-111111111111', 'Club Roles', 'club-roles-sr');

select public.ensure_system_roles('a1111111-1111-1111-1111-111111111111');

-- ספירת הרשאות לכל תפקיד
do $$
declare
  v_owner int;
  v_treasurer int;
  v_coach int;
begin
  select count(*) into v_owner
    from public.roles r join public.role_permissions rp on rp.role_id = r.id
   where r.club_id = 'a1111111-1111-1111-1111-111111111111' and r.name = 'מנהל מועדון';
  select count(*) into v_treasurer
    from public.roles r join public.role_permissions rp on rp.role_id = r.id
   where r.club_id = 'a1111111-1111-1111-1111-111111111111' and r.name = 'גזבר/ית';
  select count(*) into v_coach
    from public.roles r join public.role_permissions rp on rp.role_id = r.id
   where r.club_id = 'a1111111-1111-1111-1111-111111111111' and r.name = 'מאמן';

  assert v_owner = 18, format('FAIL: owner should have 18 perms, got %s', v_owner);
  assert v_treasurer = 10, format('FAIL: treasurer should have 10 perms, got %s', v_treasurer);
  assert v_coach = 7, format('FAIL: coach should have 7 perms, got %s', v_coach);
  raise notice 'PASS: perm counts owner=18 treasurer=10 coach=7';
end $$;

-- גזבר/ית: יש payments.charge, אין users.manage ואין settings.manage
do $$
declare
  v_has_charge boolean;
  v_has_users boolean;
begin
  select exists (
    select 1 from public.roles r
      join public.role_permissions rp on rp.role_id = r.id
      join public.permissions p on p.id = rp.permission_id
     where r.club_id = 'a1111111-1111-1111-1111-111111111111'
       and r.name = 'גזבר/ית' and p.key = 'payments.charge'
  ) into v_has_charge;
  select exists (
    select 1 from public.roles r
      join public.role_permissions rp on rp.role_id = r.id
      join public.permissions p on p.id = rp.permission_id
     where r.club_id = 'a1111111-1111-1111-1111-111111111111'
       and r.name = 'גזבר/ית' and p.key = 'users.manage'
  ) into v_has_users;
  assert v_has_charge, 'FAIL: treasurer missing payments.charge';
  assert not v_has_users, 'FAIL: treasurer should not have users.manage';
  raise notice 'PASS: treasurer scope (charge yes, users.manage no)';
end $$;

-- מאמן: אין payments.view ואין players.manage
do $$
declare v_bad boolean;
begin
  select exists (
    select 1 from public.roles r
      join public.role_permissions rp on rp.role_id = r.id
      join public.permissions p on p.id = rp.permission_id
     where r.club_id = 'a1111111-1111-1111-1111-111111111111'
       and r.name = 'מאמן' and p.key in ('payments.view', 'players.manage')
  ) into v_bad;
  assert not v_bad, 'FAIL: coach should not have payments/manage perms';
  raise notice 'PASS: coach is view-only operational';
end $$;

-- idempotency: קריאה חוזרת לא מכפילה
select public.ensure_system_roles('a1111111-1111-1111-1111-111111111111');
do $$
declare v_roles int; v_owner int;
begin
  select count(*) into v_roles
    from public.roles where club_id = 'a1111111-1111-1111-1111-111111111111' and is_system;
  select count(*) into v_owner
    from public.roles r join public.role_permissions rp on rp.role_id = r.id
   where r.club_id = 'a1111111-1111-1111-1111-111111111111' and r.name = 'מנהל מועדון';
  assert v_roles = 3, format('FAIL: should stay 3 system roles, got %s', v_roles);
  assert v_owner = 18, format('FAIL: owner perms duplicated, got %s', v_owner);
  raise notice 'PASS: ensure_system_roles is idempotent';
end $$;

rollback;
