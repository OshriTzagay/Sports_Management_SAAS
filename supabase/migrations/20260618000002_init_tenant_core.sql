-- =============================================================================
-- Phase 0 — ליבת tenant: RBAC, users, seasons, audit_logs
-- =============================================================================
-- כל הטבלאות כאן מבודדות למועדון דרך RLS: club_id = current_club_id().
-- גישת פלטפורמה לנתונים אלה נעשית בצד שרת (secret key) ומתועדת ב-audit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- permissions — קטלוג גלובלי של הרשאות גרנולריות (לא tenant-scoped).
-- -----------------------------------------------------------------------------
create table public.permissions (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,          -- לדוגמה 'players.edit', 'payments.charge'
  description text not null,
  created_at  timestamptz not null default now()
);

alter table public.permissions enable row level security;

-- קטלוג קריא לכל משתמש מאומת; כתיבה רק בצד שרת (seed/secret key).
create policy permissions_select on public.permissions
  for select using (auth.uid() is not null);

-- -----------------------------------------------------------------------------
-- roles — תפקידים לכל מועדון (אוסף permissions). is_system = ברירת מחדל מובנית.
-- -----------------------------------------------------------------------------
create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs (id) on delete cascade,
  name        text not null,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  unique (club_id, name)
);

create index idx_roles_club_id on public.roles (club_id);

create trigger trg_roles_updated_at
  before update on public.roles
  for each row execute function public.set_updated_at();

alter table public.roles enable row level security;

create policy roles_select on public.roles
  for select using (club_id = public.current_club_id());
create policy roles_manage on public.roles
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- -----------------------------------------------------------------------------
-- role_permissions — קישור role↔permission. club_id משוכפל להגנת עומק ב-RLS.
-- -----------------------------------------------------------------------------
create table public.role_permissions (
  club_id        uuid not null references public.clubs (id) on delete cascade,
  role_id        uuid not null references public.roles (id) on delete cascade,
  permission_id  uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create index idx_role_permissions_club_id on public.role_permissions (club_id);

alter table public.role_permissions enable row level security;

create policy role_permissions_select on public.role_permissions
  for select using (club_id = public.current_club_id());
create policy role_permissions_manage on public.role_permissions
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- -----------------------------------------------------------------------------
-- users — חשבונות staff של מועדון. id = auth.users.id.
-- אנשי קשר (הורים) לעולם אינם כאן — הם נתונים בלבד (Phase 2).
-- person_type/person_id מקשרים אופציונלית ל-coach/staff (ישות "אדם").
-- -----------------------------------------------------------------------------
create table public.users (
  id           uuid primary key references auth.users (id) on delete cascade,
  club_id      uuid not null references public.clubs (id) on delete cascade,
  email        text not null,
  full_name    text,
  role_id      uuid references public.roles (id) on delete set null,
  person_type  text check (person_type in ('coach', 'staff_member')),
  person_id    uuid,
  status       text not null default 'active' check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index idx_users_club_id on public.users (club_id);

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;

create policy users_select on public.users
  for select using (club_id = public.current_club_id());
create policy users_manage on public.users
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- -----------------------------------------------------------------------------
-- seasons — עונות. ישות "חיה" עונתית, scope = club_id.
-- -----------------------------------------------------------------------------
create table public.seasons (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs (id) on delete cascade,
  name        text not null,                 -- "2025/26"
  starts_on   date,
  ends_on     date,
  is_active   boolean not null default false,
  status      text not null default 'active' check (status in ('active', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  unique (club_id, name)
);

create index idx_seasons_club_id on public.seasons (club_id);
-- עונה פעילה אחת לכל מועדון (מתעלם מ-soft-deleted).
create unique index idx_seasons_one_active_per_club
  on public.seasons (club_id)
  where is_active and deleted_at is null;

create trigger trg_seasons_updated_at
  before update on public.seasons
  for each row execute function public.set_updated_at();

alter table public.seasons enable row level security;

create policy seasons_select on public.seasons
  for select using (club_id = public.current_club_id());
create policy seasons_manage on public.seasons
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- -----------------------------------------------------------------------------
-- audit_logs — תיעוד פעולות רגישות. append-only מצד הלקוח (כתיבה בצד שרת).
-- club_id = null עבור פעולות פלטפורמה רוחביות.
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid references public.clubs (id) on delete set null,
  actor_id     uuid,                          -- auth.users.id (platform או club user)
  actor_type   text not null check (actor_type in ('platform', 'user', 'system')),
  action       text not null,                 -- 'club.created', 'payment.charged'...
  entity_type  text,
  entity_id    uuid,
  before       jsonb,
  after        jsonb,
  created_at   timestamptz not null default now()
);

create index idx_audit_logs_club_id on public.audit_logs (club_id);
create index idx_audit_logs_created_at on public.audit_logs (created_at);

alter table public.audit_logs enable row level security;

-- קריאה: מועדון רואה את התיעוד שלו; פלטפורמה רואה גם פעולות רוחביות (club_id null).
-- כתיבה: בצד שרת בלבד (secret key) — אין policy ל-insert/update/delete ⇒ immutable מהלקוח.
create policy audit_logs_select on public.audit_logs
  for select using (
    club_id = public.current_club_id()
    or (club_id is null and public.is_platform_user())
  );
