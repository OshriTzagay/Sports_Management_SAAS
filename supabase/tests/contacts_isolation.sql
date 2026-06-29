-- =============================================================================
-- בדיקת contacts/player_contacts: בידוד בין מועדונים + איש-קשר-חיוב יחיד לשחקן.
-- טרנזקציונלי + rollback.
-- =============================================================================
\set ON_ERROR_STOP on
begin;

insert into public.clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111111', 'Club A', 'club-a-ct'),
  ('b2222222-2222-2222-2222-222222222222', 'Club B', 'club-b-ct');
insert into public.contacts (id, club_id, first_name) values
  ('c1000000-0000-0000-0000-0000000000a1', 'a1111111-1111-1111-1111-111111111111', 'Parent A'),
  ('c2000000-0000-0000-0000-0000000000b1', 'b2222222-2222-2222-2222-222222222222', 'Parent B');
insert into public.players (id, club_id, first_name, last_name) values
  ('91000000-0000-0000-0000-000000000091', 'a1111111-1111-1111-1111-111111111111', 'Kid', 'A');
insert into public.player_contacts (club_id, player_id, contact_id, relationship, is_billing_contact) values
  ('a1111111-1111-1111-1111-111111111111', '91000000-0000-0000-0000-000000000091', 'c1000000-0000-0000-0000-0000000000a1', 'father', true);

-- איש קשר חיוב יחיד לשחקן: שיוך חיוב נוסף נכשל
insert into public.contacts (id, club_id, first_name) values
  ('c3000000-0000-0000-0000-0000000000a2', 'a1111111-1111-1111-1111-111111111111', 'Grandpa A');
do $$
declare blocked boolean := false;
begin
  begin
    insert into public.player_contacts (club_id, player_id, contact_id, relationship, is_billing_contact) values
      ('a1111111-1111-1111-1111-111111111111', '91000000-0000-0000-0000-000000000091', 'c3000000-0000-0000-0000-0000000000a2', 'guardian', true);
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: a player got two billing contacts';
  raise notice 'PASS: one billing contact per player';
end $$;

-- בידוד: משתמש מועדון A רואה רק את אנשי הקשר שלו ולא כותב למועדון B
set local role authenticated;
set local request.jwt.claims =
  '{"role":"authenticated","app_metadata":{"club_id":"a1111111-1111-1111-1111-111111111111"}}';
do $$
begin
  assert (select count(*) from public.contacts) = 2, 'club A should see its 2 contacts';
  assert (select count(*) from public.contacts where first_name = 'Parent B') = 0, 'club A must not see club B contact';
  raise notice 'PASS: contacts read isolation';
end $$;

do $$
declare blocked boolean := false;
begin
  begin
    insert into public.contacts (club_id, first_name)
    values ('b2222222-2222-2222-2222-222222222222', 'hijack');
  exception when others then blocked := true;
  end;
  assert blocked, 'FAIL: club A inserted a contact for club B';
  raise notice 'PASS: contacts write isolation';
end $$;

reset role;
rollback;
