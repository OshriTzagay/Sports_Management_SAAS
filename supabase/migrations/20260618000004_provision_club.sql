-- =============================================================================
-- provision_club — הקמת מועדון חדש בטרנזקציה אחת (Control Plane).
-- יוצר: club + role "מנהל מועדון" (כל ההרשאות) + רשומת users למנהל + עונה ריקה
-- פעילה + audit log. משתמש האימות עצמו נוצר מראש ב-Auth Admin API, ו-id שלו
-- מועבר כאן (p_admin_user_id).
--
-- SECURITY DEFINER: רץ בהרשאות הבעלים (עוקף RLS לכתיבה חוצת-טבלאות), אך מאמת
-- מפורשות שהקורא הוא משתמש פלטפורמה (default-deny). club_id מיוצר בצד הקורא
-- ומועבר (p_club_id) כדי שיתאים ל-app_metadata.club_id של מנהל המועדון.
-- =============================================================================
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
  v_role_id uuid;
begin
  if not public.is_platform_user() then
    raise exception 'forbidden: platform user required';
  end if;

  insert into public.clubs (id, name, slug)
  values (p_club_id, p_club_name, p_slug);

  insert into public.roles (club_id, name, is_system)
  values (p_club_id, 'מנהל מועדון', true)
  returning id into v_role_id;

  insert into public.role_permissions (club_id, role_id, permission_id)
  select p_club_id, v_role_id, id from public.permissions;

  insert into public.users (id, club_id, email, full_name, role_id, status)
  values (p_admin_user_id, p_club_id, p_admin_email, p_admin_full_name, v_role_id, 'active');

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
