-- =============================================================================
-- לוגו מועדון: עמודת logo_path + bucket ציבורי ב-Storage + הרשאות.
-- נתיב הקובץ: <club_id>/logo.<ext> — כל מועדון יכול לכתוב רק לתיקייה שלו.
-- =============================================================================
alter table public.club_branding add column if not exists logo_path text;

insert into storage.buckets (id, name, public)
values ('club-logos', 'club-logos', true)
on conflict (id) do nothing;

-- קריאה ציבורית (לוגו אינו סוד)
drop policy if exists "club logo read" on storage.objects;
create policy "club logo read" on storage.objects
  for select using (bucket_id = 'club-logos');

-- כתיבה/עדכון/מחיקה — רק לתיקיית המועדון של המשתמש המחובר
drop policy if exists "club logo insert" on storage.objects;
create policy "club logo insert" on storage.objects
  for insert with check (
    bucket_id = 'club-logos'
    and (storage.foldername(name))[1] = public.current_club_id()::text
  );

drop policy if exists "club logo update" on storage.objects;
create policy "club logo update" on storage.objects
  for update using (
    bucket_id = 'club-logos'
    and (storage.foldername(name))[1] = public.current_club_id()::text
  );

drop policy if exists "club logo delete" on storage.objects;
create policy "club logo delete" on storage.objects
  for delete using (
    bucket_id = 'club-logos'
    and (storage.foldername(name))[1] = public.current_club_id()::text
  );
