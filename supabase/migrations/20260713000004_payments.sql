-- =============================================================================
-- Phase 2 — תשלומים (גבייה משחקנים). כללי ברזל:
--   כסף ב-agorot (bigint), מטבע מפורש, מע"מ היסטורי על כל חיוב, חיוב = state
--   machine, webhooks עם idempotency. סליקה מתארחת (Tranzila) — לא נוגעים בכרטיס.
-- הרשאות: payments.view / payments.charge (כבר בקטלוג). RLS club-scoped.
-- =============================================================================

-- 1) הגדרות חיוב פר-מועדון (מע"מ + מטבע). ניתן להגדרה ע"י Owner.
create table public.billing_settings (
  club_id     uuid primary key references public.clubs (id) on delete cascade,
  vat_rate    numeric(5, 2) not null default 0 check (vat_rate >= 0 and vat_rate <= 100),
  currency    text not null default 'ILS',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_billing_settings_updated_at
  before update on public.billing_settings
  for each row execute function public.set_updated_at();

alter table public.billing_settings enable row level security;
create policy billing_settings_select on public.billing_settings
  for select using (club_id = public.current_club_id());
create policy billing_settings_manage on public.billing_settings
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- 2) תוכניות חיוב (תבנית סכום/תדירות לשיוך לשחקן).
create table public.payment_plans (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid not null references public.clubs (id) on delete cascade,
  name          text not null,
  amount_agorot bigint not null check (amount_agorot >= 0),
  currency      text not null default 'ILS',
  recurrence    text not null default 'one_time'
                  check (recurrence in ('one_time', 'monthly')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_payment_plans_club_id on public.payment_plans (club_id);

create trigger trg_payment_plans_updated_at
  before update on public.payment_plans
  for each row execute function public.set_updated_at();

alter table public.payment_plans enable row level security;
create policy payment_plans_select on public.payment_plans
  for select using (club_id = public.current_club_id());
create policy payment_plans_manage on public.payment_plans
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- 3) חיובים — state machine. amount_agorot = הסכום לתשלום (כולל מע"מ);
--    vat_rate נשמר היסטורית לחישוב חשבונית.
create table public.charges (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid not null references public.clubs (id) on delete cascade,
  season_id     uuid references public.seasons (id) on delete set null,
  player_id     uuid not null references public.players (id) on delete cascade,
  contact_id    uuid references public.contacts (id) on delete set null,
  plan_id       uuid references public.payment_plans (id) on delete set null,
  description   text not null,
  amount_agorot bigint not null check (amount_agorot >= 0),
  vat_rate      numeric(5, 2) not null default 0,
  currency      text not null default 'ILS',
  status        text not null default 'pending'
                  check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  due_date      date,
  created_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index idx_charges_club_id on public.charges (club_id);
create index idx_charges_player_id on public.charges (player_id);
create index idx_charges_status on public.charges (club_id, status);

create trigger trg_charges_updated_at
  before update on public.charges
  for each row execute function public.set_updated_at();

alter table public.charges enable row level security;
create policy charges_select on public.charges
  for select using (club_id = public.current_club_id());
create policy charges_manage on public.charges
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- 4) קישורי סליקה מתארחים (Tranzila).
create table public.payment_links (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references public.clubs (id) on delete cascade,
  charge_id    uuid not null references public.charges (id) on delete cascade,
  provider     text not null default 'tranzila',
  url          text,
  external_ref text,
  status       text not null default 'active'
                 check (status in ('active', 'used', 'expired')),
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_payment_links_club_id on public.payment_links (club_id);
create index idx_payment_links_charge_id on public.payment_links (charge_id);

create trigger trg_payment_links_updated_at
  before update on public.payment_links
  for each row execute function public.set_updated_at();

alter table public.payment_links enable row level security;
create policy payment_links_select on public.payment_links
  for select using (club_id = public.current_club_id());
create policy payment_links_manage on public.payment_links
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- 5) תשלומים שהתקבלו (תיעוד מהסליקה).
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  club_id         uuid not null references public.clubs (id) on delete cascade,
  charge_id       uuid not null references public.charges (id) on delete cascade,
  amount_agorot   bigint not null check (amount_agorot >= 0),
  currency        text not null default 'ILS',
  provider        text not null default 'tranzila',
  provider_txn_id text,
  status          text not null default 'completed'
                    check (status in ('completed', 'refunded')),
  paid_at         timestamptz not null default now(),
  raw             jsonb,
  created_at      timestamptz not null default now()
);

create index idx_payments_club_id on public.payments (club_id);
create index idx_payments_charge_id on public.payments (charge_id);

alter table public.payments enable row level security;
create policy payments_select on public.payments
  for select using (club_id = public.current_club_id());
create policy payments_manage on public.payments
  for all using (club_id = public.current_club_id())
  with check (club_id = public.current_club_id());

-- 6) webhook_log — idempotency + אימות חתימה. נכתב ע"י ה-webhook handler (service
--    role, עוקף RLS). קריאה: המועדון רואה את שלו; פלטפורמה רואה הכל.
create table public.webhook_log (
  id              uuid primary key default gen_random_uuid(),
  club_id         uuid references public.clubs (id) on delete set null,
  provider        text not null default 'tranzila',
  external_id     text not null,
  signature_valid boolean not null default false,
  payload         jsonb,
  processed_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (provider, external_id)
);

create index idx_webhook_log_club_id on public.webhook_log (club_id);

alter table public.webhook_log enable row level security;
create policy webhook_log_select on public.webhook_log
  for select using (
    club_id = public.current_club_id() or public.is_platform_user()
  );
