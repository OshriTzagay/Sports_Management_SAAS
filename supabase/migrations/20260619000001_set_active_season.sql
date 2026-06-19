-- =============================================================================
-- set_active_season — קובע עונה פעילה יחידה למועדון (מכבה את הקודמת).
-- SECURITY INVOKER: רץ בהרשאות הקורא — RLS מבטיח שאפשר לגעת רק בעונות המועדון
-- של המשתמש. שתי ה-UPDATE-ים בטרנזקציה אחת (גוף הפונקציה), כדי לא להישאר ללא
-- עונה פעילה אם אחד נכשל.
-- =============================================================================
create or replace function public.set_active_season(p_season_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_club_id uuid;
begin
  select club_id into v_club_id
  from public.seasons
  where id = p_season_id and deleted_at is null;

  if v_club_id is null then
    raise exception 'season not found';
  end if;

  update public.seasons set is_active = false
  where club_id = v_club_id and is_active;

  update public.seasons set is_active = true
  where id = p_season_id;
end;
$$;

revoke all on function public.set_active_season(uuid) from public, anon;
grant execute on function public.set_active_season(uuid) to authenticated;
