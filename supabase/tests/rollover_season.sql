-- =============================================================================
-- בדיקת rollover_season: העתקת מבנה, החרגת שחקן שעזב, וחסימת יעד לא-ריק.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-ro');
insert into public.seasons (id, club_id, name, is_active) values
  ('51000000-0000-0000-0000-000000000051', 'a1111111-1111-1111-1111-111111111111', 'src', true),
  ('52000000-0000-0000-0000-000000000052', 'a1111111-1111-1111-1111-111111111111', 'tgt', false);
insert into public.teams (id, club_id, season_id, name, age_category) values
  ('71000000-0000-0000-0000-000000000071', 'a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-000000000051', 'U12', 'ילדים');
insert into public.players (id, club_id, first_name, last_name, status) values
  ('91000000-0000-0000-0000-000000000091', 'a1111111-1111-1111-1111-111111111111', 'Active', 'Player', 'active'),
  ('92000000-0000-0000-0000-000000000092', 'a1111111-1111-1111-1111-111111111111', 'Left', 'Player', 'left');
insert into public.coaches (id, club_id, first_name, last_name, status) values
  ('93000000-0000-0000-0000-000000000093', 'a1111111-1111-1111-1111-111111111111', 'Coach', 'One', 'active');
insert into public.team_players (club_id, season_id, team_id, player_id) values
  ('a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-000000000051', '71000000-0000-0000-0000-000000000071', '91000000-0000-0000-0000-000000000091'),
  ('a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-000000000051', '71000000-0000-0000-0000-000000000071', '92000000-0000-0000-0000-000000000092');
insert into public.team_coaches (club_id, season_id, team_id, coach_id, role) values
  ('a1111111-1111-1111-1111-111111111111', '51000000-0000-0000-0000-000000000051', '71000000-0000-0000-0000-000000000071', '93000000-0000-0000-0000-000000000093', 'head');

set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';

select public.rollover_season(
  '51000000-0000-0000-0000-000000000051',
  '52000000-0000-0000-0000-000000000052'
);

reset role;
do $$
declare tgt constant uuid := '52000000-0000-0000-0000-000000000052';
begin
  assert (select count(*) from public.teams where season_id = tgt and deleted_at is null) = 1, 'team not copied';
  assert (select count(*) from public.team_players where season_id = tgt and deleted_at is null) = 1, 'should copy only the active player (1)';
  assert (select count(*) from public.team_coaches where season_id = tgt and deleted_at is null) = 1, 'coach assignment not copied';
  raise notice 'PASS: rollover copied teams + active player + coach (excluded the player who left)';
end $$;

-- יעד לא-ריק: גלגול נוסף לאותו יעד חייב להיחסם
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';
do $$
declare blocked boolean := false;
begin
  begin
    perform public.rollover_season('51000000-0000-0000-0000-000000000051', '52000000-0000-0000-0000-000000000052');
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: rollover into a non-empty target was allowed';
  raise notice 'PASS: rollover blocked for non-empty target';
end $$;

reset role;
rollback;
