-- =============================================================================
-- בדיקת גמישות חיוב: הנחה/מלגה, פטור (waived), תשלום חלקי, ותשלום מזומן ידני.
-- טרנזקציוני + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug)
values ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-flex');
insert into public.players (id, club_id, first_name, last_name)
values ('91a00000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', 'Kid', 'A');

-- חיוב עם מלגה: מחיר מלא 30000, הנחה 10000, נטו 20000, שולם חלקית
insert into public.charges
  (id, club_id, player_id, description, original_amount_agorot, discount_agorot,
   discount_reason, amount_agorot, status)
values
  ('c4a00000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111',
   '91a00000-0000-0000-0000-0000000000a1', 'דמי רישום', 30000, 10000,
   'מלגת קושי כלכלי', 20000, 'partially_paid');

-- חיוב בפטור מלא
insert into public.charges (club_id, player_id, description, amount_agorot, status)
values ('a1111111-1111-1111-1111-111111111111',
        '91a00000-0000-0000-0000-0000000000a1', 'פטור', 0, 'waived');

do $$
begin
  assert (select discount_agorot from public.charges
          where id = 'c4a00000-0000-0000-0000-0000000000a1') = 10000,
    'discount stored';
  assert (select count(*) from public.charges where status = 'waived') = 1,
    'waived status allowed';
  raise notice 'PASS: discount + waived + partially_paid supported';
end $$;

-- תשלום מזומן ידני
insert into public.payments
  (club_id, charge_id, amount_agorot, provider, method)
values ('a1111111-1111-1111-1111-111111111111',
        'c4a00000-0000-0000-0000-0000000000a1', 20000, 'manual', 'cash');
do $$
begin
  assert (select method from public.payments where provider = 'manual') = 'cash',
    'cash payment recorded';
  raise notice 'PASS: manual cash payment recorded';
end $$;

-- הנחה שלילית נחסמת
do $$
declare blocked boolean := false;
begin
  begin
    update public.charges set discount_agorot = -5
    where id = 'c4a00000-0000-0000-0000-0000000000a1';
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: negative discount allowed';
  raise notice 'PASS: negative discount rejected';
end $$;

rollback;
