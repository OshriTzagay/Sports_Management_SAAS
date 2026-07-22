-- =============================================================================
-- Payments Flow — הרשמה עצמית ציבורית + תשלום.
--   registrations: טיוטת רישום ממתינה (פרטי הורה+ילד) — עדיין לא שחקן/איש-קשר.
--   רק בהצלחת תשלום המערכת "מממשת" את הרישום לישויות אמיתיות (materialization).
--   billing_settings.registration_fee_agorot: דמי רישום קבועים למועדון.
-- כתיבה מהזרימה הציבורית = service role (עוקף RLS, scope מפורש למועדון מה-slug).
-- =============================================================================

alter table public.billing_settings
  add column if not exists registration_fee_agorot bigint not null default 0
    check (registration_fee_agorot >= 0);

create table public.registrations (
  id                 uuid primary key default gen_random_uuid(),
  club_id            uuid not null references public.clubs (id) on delete cascade,
  season_id          uuid references public.seasons (id) on delete set null,
  status             text not null default 'pending'
                       check (status in ('pending', 'paid', 'completed', 'failed', 'cancelled', 'expired')),

  -- טופס: האם בוגר שמשלם על עצמו, ומהי הקרבה של המשלם.
  is_self            boolean not null default false,
  relationship       text not null default 'guardian'
                       check (relationship in ('father', 'mother', 'guardian', 'self', 'other')),

  -- פרטי השחקן (טיוטה — טרם נוצר).
  player_first_name  text not null,
  player_last_name   text not null,
  player_national_id text,
  player_birth_date  date,

  -- פרטי המשלם/איש הקשר (טיוטה).
  contact_first_name text not null,
  contact_last_name  text,
  contact_phone      text not null,
  contact_email      text,

  -- כסף (מצולם בזמן הרישום).
  amount_agorot      bigint not null check (amount_agorot >= 0),
  vat_rate           numeric(5, 2) not null default 0,
  currency           text not null default 'ILS',

  -- סליקה.
  provider           text not null default 'tranzila',
  external_ref       text,
  paid_at            timestamptz,

  -- תוצאות המימוש (לאחר הצלחה).
  player_id          uuid references public.players (id) on delete set null,
  contact_id         uuid references public.contacts (id) on delete set null,
  charge_id          uuid references public.charges (id) on delete set null,
  completed_at       timestamptz,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_registrations_club_id on public.registrations (club_id);
create index idx_registrations_status on public.registrations (club_id, status);

create trigger trg_registrations_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

alter table public.registrations enable row level security;

-- צוות רואה/מנהל רישומים של המועדון; יצירה מהזרימה הציבורית = service role.
create policy registrations_select on public.registrations
  for select using (club_id = public.current_club_id());
create policy registrations_manage on public.registrations
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());
