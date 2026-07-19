-- =============================================================================
-- Seed system roles — 3 תפקידי מערכת לכל מועדון: מנהל מועדון / גזבר/ית / מאמן.
-- מיפוי ההרשאות מתועד ב-docs/rbac-and-auth.md (§3).
--
-- ensure_system_roles(club_id) — idempotent. יוצר את שלושת התפקידים ומיפויי
-- ההרשאות אם חסרים. משמש גם בהזרעת מועדונים קיימים (backfill) וגם ב-provision_club
-- למועדונים חדשים (single source of truth).
-- =============================================================================

create or replace function public.ensure_system_roles(p_club_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id     uuid;
  v_treasurer_id uuid;
  v_coach_id     uuid;
begin
  -- מנהל מועדון (Owner) — כל ההרשאות.
  insert into public.roles (club_id, name, is_system)
  values (p_club_id, 'מנהל מועדון', true)
  on conflict (club_id, name) do nothing;
  select id into v_owner_id
    from public.roles where club_id = p_club_id and name = 'מנהל מועדון';
  insert into public.role_permissions (club_id, role_id, permission_id)
  select p_club_id, v_owner_id, id from public.permissions
  on conflict (role_id, permission_id) do nothing;

  -- גזבר/ית — כסף + אנשי קשר + צפייה תפעולית + דוחות.
  insert into public.roles (club_id, name, is_system)
  values (p_club_id, 'גזבר/ית', true)
  on conflict (club_id, name) do nothing;
  select id into v_treasurer_id
    from public.roles where club_id = p_club_id and name = 'גזבר/ית';
  insert into public.role_permissions (club_id, role_id, permission_id)
  select p_club_id, v_treasurer_id, id from public.permissions
  where key in (
    'seasons.view', 'teams.view', 'players.view', 'coaches.view',
    'contacts.view', 'contacts.manage',
    'payments.view', 'payments.charge', 'reports.view'
  )
  on conflict (role_id, permission_id) do nothing;

  -- מאמן — צפייה תפעולית בלבד.
  insert into public.roles (club_id, name, is_system)
  values (p_club_id, 'מאמן', true)
  on conflict (club_id, name) do nothing;
  select id into v_coach_id
    from public.roles where club_id = p_club_id and name = 'מאמן';
  insert into public.role_permissions (club_id, role_id, permission_id)
  select p_club_id, v_coach_id, id from public.permissions
  where key in (
    'seasons.view', 'teams.view', 'players.view', 'coaches.view', 'contacts.view'
  )
  on conflict (role_id, permission_id) do nothing;
end;
$$;

revoke all on function public.ensure_system_roles(uuid) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- provision_club — עדכון לשימוש חוזר ב-ensure_system_roles (במקום ליצור רק Owner).
-- -----------------------------------------------------------------------------
create or replace function public.provision_club(
  p_club_id uuid,
  p_club_name text,
  p_slug text,
  p_admin_user_id uuid,
  p_admin_email text,
  p_admin_full_name text,
  p_season_name text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_role_id uuid;
begin
  if not public.is_platform_user() then
    raise exception 'forbidden: platform user required';
  end if;

  insert into public.clubs (id, name, slug)
  values (p_club_id, p_club_name, p_slug);

  -- שלושת תפקידי המערכת (Owner/גזבר/מאמן) + מיפויי ההרשאות.
  perform public.ensure_system_roles(p_club_id);
  select id into v_owner_role_id
    from public.roles where club_id = p_club_id and name = 'מנהל מועדון';

  insert into public.users (id, club_id, email, full_name, role_id, status)
  values (p_admin_user_id, p_club_id, p_admin_email, p_admin_full_name, v_owner_role_id, 'active');

  insert into public.seasons (club_id, name, is_active, status)
  values (p_club_id, p_season_name, true, 'active');

  insert into public.audit_logs (club_id, actor_id, actor_type, action, entity_type, entity_id, after)
  values (
    p_club_id, auth.uid(), 'platform', 'club.provisioned', 'club', p_club_id,
    jsonb_build_object('name', p_club_name, 'slug', p_slug, 'admin_email', p_admin_email)
  );

  return p_club_id;
end;
$$;

revoke all on function public.provision_club(uuid, text, text, uuid, text, text, text) from public, anon;
grant execute on function public.provision_club(uuid, text, text, uuid, text, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Backfill — הזרעת התפקידים החסרים לכל המועדונים הקיימים.
-- -----------------------------------------------------------------------------
select public.ensure_system_roles(id) from public.clubs;
