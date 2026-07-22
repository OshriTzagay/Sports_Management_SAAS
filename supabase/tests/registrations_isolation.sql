-- =============================================================================
-- בדיקת registrations: בידוד בין מועדונים + שלמות (סכום/סטטוס). rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-reg'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-reg');

insert into public.registrations
  (id, club_id, player_first_name, player_last_name,
   contact_first_name, contact_phone, amount_agorot)
values
  ('ce100000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111',
   'בר', 'שפירא', 'דנה', '0501234567', 50000);

-- סכום שלילי נחסם
do $$
declare blocked boolean := false;
begin
  begin
    insert into public.registrations
      (club_id, player_first_name, player_last_name, contact_first_name, contact_phone, amount_agorot)
    values ('a1111111-1111-1111-1111-111111111111', 'x', 'y', 'z', '05', -1);
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: negative amount allowed';
  raise notice 'PASS: negative registration amount rejected';
end $$;

-- סטטוס לא חוקי נחסם
do $$
declare blocked boolean := false;
begin
  begin
    update public.registrations set status = 'bogus'
    where id = 'ce100000-0000-0000-0000-0000000000a1';
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: invalid registration status allowed';
  raise notice 'PASS: registration status is a bounded state machine';
end $$;

-- בידוד קריאה: מועדון A רואה רק את הרישום שלו
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';
do $$
begin
  assert (select count(*) from public.registrations) = 1, 'club A should see its 1 registration';
  raise notice 'PASS: club A sees only its own registrations';
end $$;

-- בידוד: מועדון B לא רואה ולא כותב למועדון A
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"b2222222-2222-2222-2222-222222222222"}}';
do $$
declare blocked boolean := false;
begin
  assert (select count(*) from public.registrations) = 0, 'club B should see none';
  begin
    insert into public.registrations
      (club_id, player_first_name, player_last_name, contact_first_name, contact_phone, amount_agorot)
    values ('a1111111-1111-1111-1111-111111111111', 'x', 'y', 'z', '05', 100);
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: club B wrote into club A';
  raise notice 'PASS: club B cannot write into club A';
end $$;

rollback;
