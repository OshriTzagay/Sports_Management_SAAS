-- =============================================================================
-- ת.ז. + טלפון/מייל לשני הצדדים (אופציונלי):
--   players: + phone, email (לשחקן בוגר/מבוגר; לקטין נופלים על טלפון ההורה).
--   contacts: + national_id (ת.ז. של המשלם — לקבלה/חשבונית).
--   registrations: שדות מקבילים לטופס הציבורי.
-- הכל nullable — לא נכפה; ממולא לפי הקשר.
-- =============================================================================
alter table public.players
  add column if not exists phone text,
  add column if not exists email text;

alter table public.contacts
  add column if not exists national_id text;

alter table public.registrations
  add column if not exists player_phone text,
  add column if not exists player_email text,
  add column if not exists contact_national_id text;

-- עדכון complete_registration: מיפוי השדות החדשים (שחקן: phone/email · איש-קשר: national_id).
create or replace function public.complete_registration(
  p_registration_id uuid,
  p_external_ref text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  r            public.registrations;
  v_player_id  uuid;
  v_contact_id uuid;
  v_charge_id  uuid;
  v_has_billing boolean;
begin
  select * into r from public.registrations
    where id = p_registration_id for update;
  if not found then raise exception 'registration not found'; end if;

  if r.status = 'completed' then return r.player_id; end if;
  if r.status = 'cancelled' then raise exception 'registration cancelled'; end if;

  if r.player_national_id is not null and r.player_national_id <> '' then
    select id into v_player_id from public.players
      where club_id = r.club_id and national_id = r.player_national_id
        and deleted_at is null
      limit 1;
  end if;
  if v_player_id is null then
    insert into public.players
      (club_id, first_name, last_name, national_id, birth_date, phone, email, status)
    values
      (r.club_id, r.player_first_name, r.player_last_name, r.player_national_id,
       r.player_birth_date, r.player_phone, r.player_email, 'active')
    returning id into v_player_id;
  end if;

  select id into v_contact_id from public.contacts
    where club_id = r.club_id and phone = r.contact_phone and deleted_at is null
    limit 1;
  if v_contact_id is null then
    insert into public.contacts
      (club_id, first_name, last_name, phone, email, national_id)
    values (r.club_id, r.contact_first_name, r.contact_last_name,
            r.contact_phone, r.contact_email, r.contact_national_id)
    returning id into v_contact_id;
  end if;

  select exists (
    select 1 from public.player_contacts
    where player_id = v_player_id and is_billing_contact and deleted_at is null
  ) into v_has_billing;

  insert into public.player_contacts
    (club_id, player_id, contact_id, relationship, is_billing_contact)
  values (r.club_id, v_player_id, v_contact_id, r.relationship, not v_has_billing)
  on conflict (player_id, contact_id) where deleted_at is null
  do update set relationship = excluded.relationship;

  insert into public.charges
    (club_id, season_id, player_id, contact_id, description,
     amount_agorot, vat_rate, currency, status)
  values
    (r.club_id, r.season_id, v_player_id, v_contact_id, 'דמי רישום',
     r.amount_agorot, r.vat_rate, r.currency, 'paid')
  returning id into v_charge_id;

  insert into public.payments
    (club_id, charge_id, amount_agorot, currency, provider, method,
     status, provider_txn_id, paid_at)
  values
    (r.club_id, v_charge_id, r.amount_agorot, r.currency, r.provider, 'card',
     'completed', p_external_ref, now());

  update public.registrations set
    status = 'completed', player_id = v_player_id, contact_id = v_contact_id,
    charge_id = v_charge_id,
    external_ref = coalesce(p_external_ref, external_ref),
    paid_at = now(), completed_at = now()
  where id = p_registration_id;

  return v_player_id;
end;
$$;
