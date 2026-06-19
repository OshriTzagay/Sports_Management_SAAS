-- =============================================================================
-- rollover_season — גלגול עונה: העתקת מבנה עונת מקור לעונת יעד (ריקה).
-- מעתיק קבוצות + שיבוצי שחקנים פעילים + שיוכי מאמנים פעילים. המיפוי בין
-- קבוצת מקור לקבוצת יעד נעשה לפי שם (ייחודי לעונה). אפשרי כי הזהות (players/
-- coaches) מופרדת מהשיוך העונתי (כלל הברזל #2).
--
-- SECURITY DEFINER + בדיקת בעלות מול current_club_id() (default-deny).
-- =============================================================================
create or replace function public.rollover_season(
  p_source_season_id uuid,
  p_target_season_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_club uuid := public.current_club_id();
begin
  if v_club is null then
    raise exception 'forbidden: club context required';
  end if;
  if not exists (
    select 1 from public.seasons
    where id = p_source_season_id and club_id = v_club and deleted_at is null
  ) then
    raise exception 'source season not found';
  end if;
  if not exists (
    select 1 from public.seasons
    where id = p_target_season_id and club_id = v_club and deleted_at is null
  ) then
    raise exception 'target season not found';
  end if;
  if exists (
    select 1 from public.teams
    where season_id = p_target_season_id and deleted_at is null
  ) then
    raise exception 'target season already has teams';
  end if;

  -- קבוצות
  insert into public.teams (club_id, season_id, name, age_category)
  select v_club, p_target_season_id, name, age_category
  from public.teams
  where season_id = p_source_season_id and deleted_at is null;

  -- שיבוצי שחקנים (לא כולל שחקנים שעזבו)
  insert into public.team_players (club_id, season_id, team_id, player_id)
  select v_club, p_target_season_id, tgt.id, tp.player_id
  from public.team_players tp
  join public.teams st on st.id = tp.team_id
  join public.teams tgt
    on tgt.season_id = p_target_season_id and tgt.name = st.name and tgt.deleted_at is null
  join public.players p
    on p.id = tp.player_id and p.deleted_at is null and p.status <> 'left'
  where tp.season_id = p_source_season_id and tp.deleted_at is null;

  -- שיוכי מאמנים (רק מאמנים פעילים)
  insert into public.team_coaches (club_id, season_id, team_id, coach_id, role)
  select v_club, p_target_season_id, tgt.id, tc.coach_id, tc.role
  from public.team_coaches tc
  join public.teams st on st.id = tc.team_id
  join public.teams tgt
    on tgt.season_id = p_target_season_id and tgt.name = st.name and tgt.deleted_at is null
  join public.coaches c
    on c.id = tc.coach_id and c.deleted_at is null and c.status <> 'inactive'
  where tc.season_id = p_source_season_id and tc.deleted_at is null;
end;
$$;

revoke all on function public.rollover_season(uuid, uuid) from public, anon;
grant execute on function public.rollover_season(uuid, uuid) to authenticated;
