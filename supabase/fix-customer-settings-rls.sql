-- =======================================
-- CORREZIONE: il trainer non poteva creare/modificare
-- il numero di giornate di un cliente (solo leggerlo)
-- Da eseguire in Supabase: SQL Editor > New query
-- =======================================

-- Rimuove la vecchia regola, solo in lettura
drop policy if exists "staff_legge_tutte_le_impostazioni" on public.customer_settings;

-- La sostituisce con una regola completa (lettura + scrittura)
create policy "staff_gestisce_tutte_le_impostazioni"
on public.customer_settings for all
using (public.is_staff())
with check (public.is_staff());
