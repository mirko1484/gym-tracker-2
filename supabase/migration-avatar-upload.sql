-- =======================================
-- FOTO PROFILO: colonna + spazio di archiviazione
-- Da eseguire in Supabase: SQL Editor > New query
-- =======================================


-- 1. Colonna per l'indirizzo della foto sul profilo

alter table public.profiles
add column if not exists avatar_url text;


-- 2. Spazio di archiviazione dedicato alle foto profilo
-- (pubblico in lettura: le foto profilo non sono dati sensibili;
-- ognuno può scrivere solo dentro la propria cartella)

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;


-- 3. Chiunque può VEDERE le foto profilo (bucket pubblico)

create policy "avatar_pubblico_in_lettura"
on storage.objects for select
using (bucket_id = 'avatars');


-- 4. Ognuno può caricare SOLO dentro la propria cartella
-- (il nome del file deve iniziare con il proprio id utente)

create policy "utente_carica_solo_il_proprio_avatar"
on storage.objects for insert
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);


-- 5. Ognuno può sostituire SOLO la propria foto

create policy "utente_aggiorna_solo_il_proprio_avatar"
on storage.objects for update
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);


-- 6. Ognuno può eliminare SOLO la propria foto

create policy "utente_elimina_solo_il_proprio_avatar"
on storage.objects for delete
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);
