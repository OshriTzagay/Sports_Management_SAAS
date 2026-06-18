-- =============================================================================
-- set_club_status — שינוי סטטוס מועדון (השעיה/הפעלה) מה-Control Plane.
-- SECURITY DEFINER + בדיקת is_platform (default-deny) + audit log על השינוי.
-- =============================================================================
create or replace function public.set_club_status(p_club_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_status text;
begin
  if not public.is_platform_user() then
    raise exception 'forbidden: platform user required';
  end if;
  if p_status not in ('trial', 'active', 'suspended') then
    raise exception 'invalid status: %', p_status;
  end if;

  select status into v_old_status from public.clubs where id = p_club_id;
  if v_old_status is null then
    raise exception 'club not found: %', p_club_id;
  end if;

  update public.clubs set status = p_status where id = p_club_id;

  insert into public.audit_logs (club_id, actor_id, actor_type, action, entity_type, entity_id, before, after)
  values (
    p_club_id, auth.uid(), 'platform', 'club.status_changed', 'club', p_club_id,
    jsonb_build_object('status', v_old_status), jsonb_build_object('status', p_status)
  );
end;
$$;

revoke all on function public.set_club_status(uuid, text) from public, anon;
grant execute on function public.set_club_status(uuid, text) to authenticated;
