-- =============================================================================
-- נתוני דמו למועדון 'club-demo' — עונות, קבוצות, שחקנים, מאמנים ושיוכים.
-- idempotent (on conflict do nothing). הרצה דרך psql מול ה-Session pooler.
-- =============================================================================
do $$
declare
  v_club   uuid;
  v_season uuid;
  v_teams  int;
begin
  select id into v_club from public.clubs where slug = 'club-demo';
  if v_club is null then
    raise exception 'demo club (club-demo) not found — provision it first';
  end if;
  select id into v_season
  from public.seasons
  where club_id = v_club and is_active and deleted_at is null
  limit 1;
  if v_season is null then
    raise exception 'no active season for the demo club';
  end if;

  -- ---- עונות היסטוריות (סגורות) ----
  insert into public.seasons (club_id, name, status, is_active)
  select v_club, y::text || '/' || lpad(((y + 1) % 100)::text, 2, '0'), 'closed', false
  from generate_series(2016, 2024) as y
  on conflict do nothing;

  -- ---- קבוצות בעונה הפעילה ----
  insert into public.teams (club_id, season_id, name, age_category) values
    (v_club, v_season, 'בוגרים', '18+'),
    (v_club, v_season, 'נוער א', '17-18'),
    (v_club, v_season, 'נוער ב', '15-16'),
    (v_club, v_season, 'נערים א', '14'),
    (v_club, v_season, 'נערים ב', '13'),
    (v_club, v_season, 'ילדים א', '12'),
    (v_club, v_season, 'ילדים ב', '11'),
    (v_club, v_season, 'קט-רגל', '9-10'),
    (v_club, v_season, 'טרום', '7-8'),
    (v_club, v_season, 'נשים', '16+')
  on conflict do nothing;

  -- ---- שחקנים ----
  insert into public.players (club_id, first_name, last_name, national_id, birth_date, status) values
    (v_club, 'דניאל', 'כהן',     '311111111', '2007-03-12', 'active'),
    (v_club, 'איתי',  'לוי',     '322222222', '2008-06-01', 'active'),
    (v_club, 'נועם',  'מזרחי',   '333333333', '2009-09-20', 'active'),
    (v_club, 'יואב',  'פרץ',     '344444444', '2006-01-15', 'active'),
    (v_club, 'עידו',  'ביטון',   '355555555', '2010-11-05', 'active'),
    (v_club, 'אורי',  'דהן',     '366666666', '2007-07-30', 'active'),
    (v_club, 'רן',    'אברהם',   '377777777', '2008-02-18', 'inactive'),
    (v_club, 'גיא',   'גולן',    '388888888', '2009-04-25', 'active'),
    (v_club, 'עומר',  'חדד',     '399999999', '2006-12-10', 'active'),
    (v_club, 'אלון',  'סבן',     '300000010', '2010-08-08', 'active'),
    (v_club, 'תומר',  'אזולאי',  '300000011', '2007-05-14', 'left'),
    (v_club, 'שחר',   'אוחיון',  '300000012', '2008-10-02', 'active'),
    (v_club, 'ליאור', 'ברגיל',   '300000013', '2009-01-22', 'active'),
    (v_club, 'בר',    'שפירא',   '300000014', '2006-09-09', 'active'),
    (v_club, 'עידן',  'פרידמן',  '300000015', '2010-03-03', 'active')
  on conflict do nothing;

  -- ---- מאמנים ----
  insert into public.coaches (club_id, first_name, last_name, phone, certification, license_expiry, status) values
    (v_club, 'יוסי', 'אברהמי', '050-1234567', 'מאמן UEFA B', '2027-06-30', 'active'),
    (v_club, 'משה',  'דוד',    '052-2345678', 'מאמן A',      '2024-01-15', 'active'),
    (v_club, 'אבי',  'כץ',     '054-3456789', 'מאמן נוער',   '2026-09-01', 'active'),
    (v_club, 'רוני', 'שמש',    '053-4567890', null,          '2025-12-31', 'active'),
    (v_club, 'דוד',  'הראל',   '050-5678901', 'מאמן שוערים', '2023-05-20', 'inactive'),
    (v_club, 'ניר',  'אלון',   '052-6789012', 'מאמן B',      '2028-03-10', 'active'),
    (v_club, 'גל',   'ברק',    '054-7890123', 'מאמן כושר',   '2026-02-28', 'active'),
    (v_club, 'עידו', 'נחום',   '053-8901234', null,          null,         'active'),
    (v_club, 'שי',   'לביא',   '050-9012345', 'מאמן A',      '2027-11-11', 'active'),
    (v_club, 'איל',  'רגב',    '052-0123456', 'מאמן נוער',   '2024-08-08', 'active'),
    (v_club, 'טל',   'מור',    '054-1112223', 'מאמן UEFA B', '2029-01-01', 'active'),
    (v_club, 'רועי', 'גל',     '053-2223334', 'מאמן שוערים', '2025-07-15', 'inactive')
  on conflict do nothing;

  select count(*) into v_teams from public.teams
  where season_id = v_season and deleted_at is null;

  -- ---- שיבוץ שחקנים לקבוצות (round-robin) ----
  insert into public.team_players (club_id, season_id, team_id, player_id)
  select v_club, v_season, t.id, p.id
  from (
    select id, row_number() over (order by created_at, id) as rn
    from public.players where club_id = v_club and deleted_at is null
  ) p
  join (
    select id, row_number() over (order by name) as rn
    from public.teams where season_id = v_season and deleted_at is null
  ) t on ((p.rn - 1) % v_teams) + 1 = t.rn
  on conflict do nothing;

  -- ---- שיוך מאמנים לקבוצות עם תפקיד (round-robin) ----
  insert into public.team_coaches (club_id, season_id, team_id, coach_id, role)
  select v_club, v_season, t.id, c.id,
    (array['head', 'assistant', 'goalkeeping'])[((c.rn - 1) % 3) + 1]
  from (
    select id, row_number() over (order by created_at, id) as rn
    from public.coaches where club_id = v_club and deleted_at is null
  ) c
  join (
    select id, row_number() over (order by name) as rn
    from public.teams where season_id = v_season and deleted_at is null
  ) t on ((c.rn - 1) % v_teams) + 1 = t.rn
  on conflict do nothing;

  raise notice 'seeded demo data for club-demo';
end $$;
