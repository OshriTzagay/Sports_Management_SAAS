-- =============================================================================
-- complete_registration — "מימוש" רישום ששולם, בטרנזקציה אטומית + idempotent.
--   find-or-create שחקן (לפי ת.ז. במועדון) → איש קשר (לפי טלפון) → קישור (billing)
--   → חיוב 'paid' + תשלום → סימון הרישום כ-completed.
-- נקרא server-side אחרי אימות תשלום (webhook/סימולציה) עם service_role.
-- SECURITY DEFINER + FOR UPDATE (מונע עיבוד כפול תחת מרוץ). webhook חוזר → מדלג.
-- =============================================================================
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

  -- idempotency: כבר מומש → מחזירים את השחקן הקיים בלי לשכפל.
  if r.status = 'completed' then return r.player_id; end if;
  if r.status = 'cancelled' then raise exception 'registration cancelled'; end if;

  -- שחקן: find-or-create לפי ת.ז. במועדון.
  if r.player_national_id is not null and r.player_national_id <> '' then
    select id into v_player_id from public.players
      where club_id = r.club_id and national_id = r.player_national_id
        and deleted_at is null
      limit 1;
  end if;
  if v_player_id is null then
    insert into public.players
      (club_id, first_name, last_name, national_id, birth_date, status)
    values
      (r.club_id, r.player_first_name, r.player_last_name,
       r.player_national_id, r.player_birth_date, 'active')
    returning id into v_player_id;
  end if;

  -- איש קשר: find-or-create לפי טלפון במועדון (הורה שרושם 2 ילדים = אותו איש קשר).
  select id into v_contact_id from public.contacts
    where club_id = r.club_id and phone = r.contact_phone and deleted_at is null
    limit 1;
  if v_contact_id is null then
    insert into public.contacts (club_id, first_name, last_name, phone, email)
    values (r.club_id, r.contact_first_name, r.contact_last_name,
            r.contact_phone, r.contact_email)
    returning id into v_contact_id;
  end if;

  -- קישור שחקן↔איש-קשר. is_billing רק אם לשחקן אין עדיין משלם (אילוץ יחיד).
  select exists (
    select 1 from public.player_contacts
    where player_id = v_player_id and is_billing_contact and deleted_at is null
  ) into v_has_billing;

  insert into public.player_contacts
    (club_id, player_id, contact_id, relationship, is_billing_contact)
  values (r.club_id, v_player_id, v_contact_id, r.relationship, not v_has_billing)
  on conflict (player_id, contact_id) where deleted_at is null
  do update set relationship = excluded.relationship;

  -- חיוב משולם + תשלום.
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

revoke all on function public.complete_registration(uuid, text)
  from public, anon, authenticated;
grant execute on function public.complete_registration(uuid, text) to service_role;
