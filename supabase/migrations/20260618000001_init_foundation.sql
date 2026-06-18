-- =============================================================================
-- Phase 0 — תשתית: extensions, helper functions, platform_users, clubs
-- =============================================================================
-- מודל הבידוד: כל טבלת tenant נושאת club_id. RLS אוכף בידוד דרך JWT claim:
-- club_id נצרב ל-app_metadata של המשתמש, ו-RLS קורא אותו ב-current_club_id().
-- גישת פלטפורמה לנתוני tenant נעשית בצד שרת (secret key) ומתועדת — לא דרך RLS.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Helper functions (search_path מקובע למניעת hijacking)
-- -----------------------------------------------------------------------------

-- מזהה המועדון של הבקשה הנוכחית, מתוך ה-JWT (app_metadata.club_id).
create or replace function public.current_club_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'club_id', '')::uuid;
$$;

-- האם המשתמש הנוכחי הוא משתמש פלטפורמה (Control Plane).
create or replace function public.is_platform_user()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'is_platform')::boolean, false);
$$;

-- מעדכן updated_at אוטומטית בכל UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- platform_users — משתמשי Control Plane. נפרד לגמרי מ-users של המועדונים.
-- id = auth.users.id (פרופיל 1:1 למשתמש האימות).
-- -----------------------------------------------------------------------------
create table public.platform_users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'support' check (role in ('admin', 'support')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create trigger trg_platform_users_updated_at
  before update on public.platform_users
  for each row execute function public.set_updated_at();

alter table public.platform_users enable row level security;

-- רק משתמשי פלטפורמה רואים/מנהלים את טבלת הפלטפורמה.
create policy platform_users_select on public.platform_users
  for select using (public.is_platform_user());
create policy platform_users_manage on public.platform_users
  for all using (public.is_platform_user())
  with check (public.is_platform_user());

-- -----------------------------------------------------------------------------
-- clubs — המועדונים (tenants).
-- -----------------------------------------------------------------------------
create table public.clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,          -- subdomain ייחודי
  status      text not null default 'trial' check (status in ('trial', 'active', 'suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index idx_clubs_deleted_at on public.clubs (deleted_at);

create trigger trg_clubs_updated_at
  before update on public.clubs
  for each row execute function public.set_updated_at();

alter table public.clubs enable row level security;

-- משתמש פלטפורמה רואה הכל; משתמש מועדון רואה רק את המועדון שלו.
create policy clubs_select on public.clubs
  for select using (
    public.is_platform_user() or id = public.current_club_id()
  );
-- יצירה/עריכה/השעיה של מועדונים — פלטפורמה בלבד (provisioning).
create policy clubs_manage on public.clubs
  for all using (public.is_platform_user())
  with check (public.is_platform_user());
