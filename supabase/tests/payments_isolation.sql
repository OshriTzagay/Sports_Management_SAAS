-- =============================================================================
-- בדיקת charges/payments: בידוד בין מועדונים + שלמות כספית + idempotency ל-webhook.
-- אזור כסף → בידוד חובה. טרנזקציוני + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-pay'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-pay');
insert into public.players (id, club_id, first_name, last_name) values
  ('91a00000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', 'Kid', 'A');

insert into public.charges (id, club_id, player_id, description, amount_agorot, vat_rate)
values ('c4a00000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111',
        '91a00000-0000-0000-0000-0000000000a1', 'דמי רישום', 30000, 18.00);

-- סכום שלילי נחסם
do $$
declare blocked boolean := false;
begin
  begin
    insert into public.charges (club_id, player_id, description, amount_agorot)
    values ('a1111111-1111-1111-1111-111111111111',
            '91a00000-0000-0000-0000-0000000000a1', 'שלילי', -100);
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: negative amount allowed';
  raise notice 'PASS: negative amount rejected';
end $$;

-- סטטוס לא חוקי נחסם
do $$
declare blocked boolean := false;
begin
  begin
    update public.charges set status = 'bogus'
    where id = 'c4a00000-0000-0000-0000-0000000000a1';
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: invalid charge status allowed';
  raise notice 'PASS: charge status is a bounded state machine';
end $$;

-- idempotency: אותו webhook פעמיים נכשל על ה-unique
insert into public.webhook_log (provider, external_id, signature_valid)
values ('tranzila', 'txn-123', true);
do $$
declare blocked boolean := false;
begin
  begin
    insert into public.webhook_log (provider, external_id, signature_valid)
    values ('tranzila', 'txn-123', true);
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: duplicate webhook event allowed';
  raise notice 'PASS: webhook idempotency (unique provider+external_id)';
end $$;

-- בידוד: מועדון A רואה רק את החיוב שלו
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';
do $$
begin
  assert (select count(*) from public.charges) = 1, 'club A should see its 1 charge';
  raise notice 'PASS: club A sees only its own charges';
end $$;

-- בידוד כתיבה: מועדון B לא יכול לכתוב חיוב למועדון A
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"b2222222-2222-2222-2222-222222222222"}}';
do $$
declare blocked boolean := false;
begin
  assert (select count(*) from public.charges) = 0, 'club B should see no charges';
  begin
    insert into public.charges (club_id, player_id, description, amount_agorot)
    values ('a1111111-1111-1111-1111-111111111111',
            '91a00000-0000-0000-0000-0000000000a1', 'פריצה', 5000);
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: club B wrote a charge into club A';
  raise notice 'PASS: club B cannot write into club A';
end $$;

rollback;
