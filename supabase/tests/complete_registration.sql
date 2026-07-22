-- =============================================================================
-- בדיקת complete_registration: מימוש אטומי, idempotency, שיוך לשחקן קיים לפי ת.ז.
-- אזור כסף → בדיקה יסודית. טרנזקציוני + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug)
values ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-cr');
insert into public.seasons (id, club_id, name, is_active, status)
values ('5ea50000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', '26/27', true, 'active');

-- רישום חדש (בר שפירא, ת.ז. 000000018) — אין שחקן קיים
insert into public.registrations
  (id, club_id, season_id, relationship, player_first_name, player_last_name,
   player_national_id, contact_first_name, contact_phone, contact_email, amount_agorot, vat_rate)
values
  ('c1e00000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111',
   '5ea50000-0000-0000-0000-0000000000a1', 'mother', 'בר', 'שפירא',
   '000000018', 'דנה', '0501234567', 'dana@example.com', 50000, 18.00);

-- מימוש ראשון
select public.complete_registration('c1e00000-0000-0000-0000-0000000000a1', 'txn-abc');

do $$
declare v_player uuid; v_charges int; v_payments int; v_billing int; v_status text;
begin
  select player_id, status into v_player, v_status from public.registrations
    where id = 'c1e00000-0000-0000-0000-0000000000a1';
  assert v_status = 'completed', 'registration should be completed';
  assert v_player is not null, 'player materialized';

  assert (select count(*) from public.players
          where club_id='a1111111-1111-1111-1111-111111111111') = 1, 'one player created';
  assert (select count(*) from public.contacts
          where club_id='a1111111-1111-1111-1111-111111111111') = 1, 'one contact created';
  select count(*) into v_billing from public.player_contacts
    where player_id = v_player and is_billing_contact;
  assert v_billing = 1, 'exactly one billing contact';
  select count(*) into v_charges from public.charges where player_id = v_player and status='paid';
  assert v_charges = 1, 'one paid charge';
  select count(*) into v_payments from public.payments where club_id = 'a1111111-1111-1111-1111-111111111111';
  assert v_payments = 1, 'one payment';
  raise notice 'PASS: registration materialized (player+contact+billing+paid charge+payment)';
end $$;

-- idempotency: קריאה חוזרת (webhook כפול) לא מכפילה
select public.complete_registration('c1e00000-0000-0000-0000-0000000000a1', 'txn-abc');
do $$
begin
  assert (select count(*) from public.players
          where club_id='a1111111-1111-1111-1111-111111111111') = 1, 'still one player';
  assert (select count(*) from public.charges where club_id = 'a1111111-1111-1111-1111-111111111111') = 1, 'still one charge';
  assert (select count(*) from public.payments where club_id = 'a1111111-1111-1111-1111-111111111111') = 1, 'still one payment';
  raise notice 'PASS: complete_registration is idempotent (double webhook safe)';
end $$;

-- שיוך לשחקן קיים לפי ת.ז.: רישום שני עם אותה ת.ז. → אותו שחקן, חיוב חדש
insert into public.registrations
  (id, club_id, season_id, relationship, player_first_name, player_last_name,
   player_national_id, contact_first_name, contact_phone, amount_agorot)
values
  ('c1e00000-0000-0000-0000-0000000000a2', 'a1111111-1111-1111-1111-111111111111',
   '5ea50000-0000-0000-0000-0000000000a1', 'mother', 'בר', 'שפירא',
   '000000018', 'דנה', '0501234567', 30000);
select public.complete_registration('c1e00000-0000-0000-0000-0000000000a2', 'txn-def');
do $$
begin
  assert (select count(*) from public.players
          where club_id='a1111111-1111-1111-1111-111111111111') = 1, 'still one player (attached)';
  assert (select count(*) from public.contacts
          where club_id='a1111111-1111-1111-1111-111111111111') = 1, 'still one contact (dedup by phone)';
  assert (select count(*) from public.charges where club_id = 'a1111111-1111-1111-1111-111111111111') = 2, 'second charge created';
  raise notice 'PASS: same ID attaches to existing player + contact dedup by phone';
end $$;

rollback;
