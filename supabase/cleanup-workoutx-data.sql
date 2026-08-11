-- =======================================
-- PULIZIA: rimuove i dati importati da WorkoutX
-- (per il problema di licenza scoperto — i loro termini
-- vietano l'archiviazione in blocco dei dati)
-- Da eseguire in Supabase: SQL Editor > New query
-- =======================================

delete from public.exercise_catalog;

-- Nota: la tabella resta (non fa danno lasciarla vuota),
-- semplicemente l'app non la usa più.
