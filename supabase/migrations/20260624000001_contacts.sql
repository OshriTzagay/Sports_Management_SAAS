-- =============================================================================
-- Phase 2 — אנשי קשר. contacts = נתונים בלבד (ללא login, כלל הברזל #4).
-- player_contacts = קישור many-to-many עם relationship + is_billing_contact
-- (שני מושגים נפרדים: קשר אנושי מול תפקיד חיוב).
-- =============================================================================
create table public.contacts (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs (id) on delete cascade,
  first_name  text not null,
  last_name   text,
  phone       text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index idx_contacts_club_id on public.contacts (club_id);

create trigger trg_contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;

create policy contacts_select on public.contacts
  for select using (club_id = public.current_club_id());
create policy contacts_manage on public.contacts
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- -----------------------------------------------------------------------------
-- player_contacts — קישור שחקן↔איש קשר.
-- relationship: אבא/אמא/אפוטרופוס/עצמי/אחר. is_billing_contact: מי מקבל חיוב.
-- -----------------------------------------------------------------------------
create table public.player_contacts (
  id                 uuid primary key default gen_random_uuid(),
  club_id            uuid not null references public.clubs (id) on delete cascade,
  player_id          uuid not null references public.players (id) on delete cascade,
  contact_id         uuid not null references public.contacts (id) on delete cascade,
  relationship       text not null default 'other'
                       check (relationship in ('father', 'mother', 'guardian', 'self', 'other')),
  is_billing_contact boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

create index idx_player_contacts_club_id on public.player_contacts (club_id);
create index idx_player_contacts_player_id on public.player_contacts (player_id);
create index idx_player_contacts_contact_id on public.player_contacts (contact_id);

-- קישור יחיד בין שחקן לאיש קשר (פעיל)
create unique index idx_player_contacts_unique_link
  on public.player_contacts (player_id, contact_id)
  where deleted_at is null;
-- איש קשר אחד לחיוב לכל שחקן
create unique index idx_player_contacts_one_billing
  on public.player_contacts (player_id)
  where is_billing_contact and deleted_at is null;

create trigger trg_player_contacts_updated_at
  before update on public.player_contacts
  for each row execute function public.set_updated_at();

alter table public.player_contacts enable row level security;

create policy player_contacts_select on public.player_contacts
  for select using (club_id = public.current_club_id());
create policy player_contacts_manage on public.player_contacts
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
