-- =======================================
-- MIGRAZIONE: aggiunge la colonna email
-- Da eseguire in Supabase: SQL Editor > New query
-- (una tantum, se hai già eseguito lo schema v3)
-- =======================================

alter table public.profiles
add column email text;
