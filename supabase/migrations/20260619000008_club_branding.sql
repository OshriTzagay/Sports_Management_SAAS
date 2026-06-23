-- =============================================================================
-- club_branding — התאמה אישית של המועדון (White-label). שורה אחת לכל מועדון.
-- צבע המותג נטען כ-CSS variable בזמן ריצה (סקאלת ה-primary נגזרת ממנו).
-- לוגו (Storage) יתווסף בהמשך.
-- =============================================================================
create table public.club_branding (
  club_id       uuid primary key references public.clubs (id) on delete cascade,
  display_name  text,
  primary_color text check (primary_color is null or primary_color ~ '^#[0-9a-fA-F]{6}$'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_club_branding_updated_at
  before update on public.club_branding
  for each row execute function public.set_updated_at();

alter table public.club_branding enable row level security;

create policy club_branding_select on public.club_branding
  for select using (club_id = public.current_club_id());
create policy club_branding_manage on public.club_branding
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
